// src/export-obj-texture.js
// Export a mesh and texture as OBJ, MTL, PNG
// Args: mesh - object with {vertices, faces, uvs, texture} as present in the viewer
//        filenameBase - base name for all output files
//        texture - (optional) TIM decoded {width, height, data: Uint8ClampedArray RGBA}
// Usage: exportObjWithTexture(mesh, "Room123")

function exportObjWithTexture(mesh, filenameBase = "exported_room") {
    if (!mesh || !mesh.vertices || !mesh.faces || !mesh.uvs || !mesh.texture) {
        alert("Mesh or texture data incomplete!");
        return;
    }
    const objLines = [];
    const mtlLines = [];
    const vOffset = 1; // .obj indices 1-based

    // Write MTL file header and a material block
    const mtlName = filenameBase + ".mtl";
    const texName = filenameBase + ".png";
    mtlLines.push(`newmtl roomMat`);
    mtlLines.push(`Ka 1.000 1.000 1.000`);
    mtlLines.push(`Kd 1.000 1.000 1.000`);
    mtlLines.push(`Ks 0.000 0.000 0.000`);
    mtlLines.push(`d 1.0`);
    mtlLines.push(`illum 2`);
    mtlLines.push(`map_Kd ${texName}`);
    mtlLines.push("");    

    // Write OBJ header
    objLines.push(`# Exported Room`);
    objLines.push(`mtllib ${mtlName}`);
    objLines.push(`usemtl roomMat`);
    objLines.push("");

    // Vertices
    for (const v of mesh.vertices) {
        objLines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
    }
    // UVs
    for (const uv of mesh.uvs) {
        objLines.push(`vt ${uv[0]} ${1.0 - uv[1]}`); // OBJ vt is (u, 1-v)
    }
    // Faces: assumes each face is {v0, v1, v2} with indices, and optional UV mapping
    for (const f of mesh.faces) {
        // (OBJ face indices are 1-based; f.v*, f.uv* are zero-based into vertices/uvs)
        objLines.push(
            `f ${f.v0+vOffset}/${f.uv0+vOffset} ${f.v1+vOffset}/${f.uv1+vOffset} ${f.v2+vOffset}/${f.uv2+vOffset}`
        );
    }

    // Output files (browser: use blobs and links)
    saveTextFile(objLines.join("\n"), filenameBase + ".obj");
    saveTextFile(mtlLines.join("\n"), filenameBase + ".mtl");
    savePNG(mesh.texture, filenameBase + ".png");
}

// Save helpers (browser)
function saveTextFile(data, filename) {
    const blob = new Blob([data], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => {
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }, 100);
}

function savePNG(texture, filename) {
    // texture: {width, height, data: Uint8ClampedArray, RGBA}
    const cnv = document.createElement("canvas");
    cnv.width = texture.width;
    cnv.height = texture.height;
    const ctx = cnv.getContext("2d");
    const imgData = ctx.createImageData(texture.width, texture.height);
    imgData.data.set(texture.data);
    ctx.putImageData(imgData, 0, 0);

    cnv.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download
