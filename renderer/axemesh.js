class Axemesh extends GuaObject {
    constructor(){
        super()
        this.position = GuaVector.new(0, 0, 0)
        // 旋转角度
        this.rotation = GuaVector.new(0, 0, 0)
        // 三角形数组
        this.triangles = []
        // axeImage 像素
        this.axeImage = {
            pixels: [],
            w: 0,
            h: 0
        }
    }
    // 不带贴图的 3D 模型
    static fromAxe3D(axe3dString) {
        let axeMesh = this.new()
        const toVector = (triangles, triangle) => {
            if (triangle.length === 3) {
                let vectors = []
                triangle.forEach(v => {
                    let a = v.split(' ').map(Number)
                    let guavector = GuaVector.new(...a)
                    vectors.push(guavector)
                })
                triangles.push(vectors)
            }
            return triangles
        }
        const triangles = axe3dString.split('\n').slice(4).map(t => t.trim().split('#')).reduce(toVector, [])
        axeMesh.triangles = triangles

        return axeMesh
    }
    // 直接画 2D 贴图
    static fromAxeImage(axeImageString) {
        let axeMesh = this.new()
        const toPixel = (pixels, pixelLine) => {
            if (pixelLine.length === 256) {
                let l = pixelLine.map(point => point.split(' ').map(Number))
                pixels.push(l)
            }
            return pixels
        }
        const pixels = axeImageString.split('\n').slice(5).map(t => t.trim().split('#')).reduce(toPixel, [])
        axeMesh.axeImage.pixels = pixels
        axeMesh.axeImage.w = Number(axeImageString.split('\n')[3].trim())
        axeMesh.axeImage.h = Number(axeImageString.split('\n')[4].trim())
        return axeMesh
    }
    // 带贴图的 3D 模型
    static fromAxe3dWithuv(axe3dString) {
        let axeMesh = this.new()
        const toVector = (triangles, triangle) => {
            if (triangle.length === 3) {
                let vectors = []
                // 处理每个顶点
                triangle.forEach(vertexInfo => {
                    let a = vertexInfo.split(' ').map(Number)
                    let guavector = GuaVector.new(...a.slice(0, 3))
                    let uv = Image.new(...a.slice(3))
                    let vertex = GuaVertex.new(guavector, null, uv)
                    vectors.push(vertex)
                })
                triangles.push(vectors)
            }
            return triangles
        }
        const triangles = axe3dString.split('\n').slice(4).map(t => t.trim().split('#')).reduce(toVector, [])
        axeMesh.triangles = triangles
        return axeMesh
    }
    // 处理需要位运算的 .guaimage 格式
    static fromGuaImage(guaImage) {
        let axeMesh = this.new()
        let iniArr = guaImage.trim().split('\n')
        let w = iniArr[2]
        let h = iniArr[3]
        const convertToRGB = point => {
            point = Number(point)
            let r = (point >>> 24) & 255
            let g = (point >>>16) & 255
            let b = (point >>> 8) & 255
            let a = point & 255
            return [r, g, b, a]
        }
        let pixels = iniArr.slice(4).map(l => l.split(' ').map(convertToRGB))
        axeMesh.axeImage.pixels = pixels
        axeMesh.axeImage.w = Number(w)
        axeMesh.axeImage.h = Number(h)
        return axeMesh
    }
    // 带法向量的 .gua3d 处理
    static fromGua3d(gua3d) {
        let axeMesh = this.new()
        let iniArr = gua3d.trim().split('\n')
        let vertices_len = Number(iniArr[2].split(' ')[1])
        let triangles_len = Number(iniArr[3].split(' ')[1])
        let vertices_arr = iniArr.slice(4, 4 + vertices_len).map(v => v.split(' ').map(Number))
        let triangles_arr = iniArr.slice(4 + vertices_len, 4 + vertices_len + triangles_len).map(v => v.split(' ').map(Number))
        const generateVertex = (x, y, z, nx, ny, nz, u, v) => {
            let vector = GuaVector.new(x, y, z)
            let normal = GuaVector.new(nx, ny, nz)
            let image = Image.new(u, v)
            return GuaVertex.new(vector, null, image, normal)
        }
        let triangles = []
        for (let i = 0; i < triangles_arr.length; i++) {
            let triangle_idx = triangles_arr[i]
            let triangle = triangle_idx.map(idx =>
                generateVertex(...vertices_arr[idx])
            )
            triangles.push(triangle)
        }
        axeMesh.triangles = triangles
        return axeMesh
    }
}
