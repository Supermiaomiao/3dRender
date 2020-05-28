class GuaCamera extends GuaObject {
    constructor() {
        super()
        // 镜头在世界坐标系中的坐标
        // this.position = GuaVector.new(0, 0, -10)
        this.position = GuaVector.new(config.camera_position_x.value, config.camera_position_y.value, config.camera_position_z.value)
        // log('this.position', this.position)
        // 镜头看的地方
        // this.target = GuaVector.new(0, 1, 0)
        this.target = GuaVector.new(config.camera_target_x.value, config.camera_target_y.value, config.camera_target_z.value)
        // log('this.target', this.target)
        // 镜头向上的方向
        // this.up = GuaVector.new(0, 1, 0)
        this.up = GuaVector.new(config.camera_up_x.value, config.camera_up_y.value, config.camera_up_z.value)
        // log('this.up', this.up)
    }
}
class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.depth = this.depthInit()
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        // this.pixelBuffer = this.pixels.data
        this.camera = GuaCamera.new()
    }
    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    clear(color=GuaColor.black()) {
        // 重置 z
        this.depth = this.depthInit()
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        let z = 0
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, z, color)
            }
        }
        this.render()
    }
    depthInit() {
        let {w, h} = this
        let depth = []
        for (let i = 0; i < w; i++) {
            depth[i] = []
            for (let j = 0; j < h; j++) {
                depth[i][j] = 0
            }
        }
        return depth
    }
    _setPixel(x, y, z, color) {
        // color: GuaColor
        // 这个函数用来设置像素点, _ 开头表示这是一个内部函数, 这是我们的约定
        // 浮点转 int
        let int = Math.round
        x = int(x)
        y = int(y)
        // 比较 z 和 depth 已存大小决定要不要画点
        // z 大的在前面
        let pixel = this.depth[x][y]
        if ( pixel == 0 || pixel >  z ) {
            this.depth[x][y] = z
            // 用座标算像素下标
            let i = (y * this.w + x) * this.bytesPerPixel
            // 设置像素
            let p = this.pixels.data
            let {r, g, b, a} = color
            // 一个像素 4 字节, 分别表示 r g b a
            p[i] = r
            p[i+1] = g
            p[i+2] = b
            p[i+3] = a
        }
    }
    drawPoint(point, color=GuaColor.black()) {
        // point: GuaVector
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                if (color.a !== 0) {
                    // 混色
                    let bgColor = GuaColor.new(255, 255, 255, 255)
                    let realColor = GuaColor.mix(color, bgColor)
                    this._setPixel(p.x, p.y, p.z, realColor)
                }
            }
        }
    }
    drawScanline(v1, v2, lightFactor) {
        let [a, b] = [v1, v2].sort((va, vb) => va.position.x - vb.position.x)
        let y = a.position.y
        let x1 = a.position.x
        let x2 = b.position.x
        let z1 = a.position.z
        let z2 = b.position.z
        for (let x = x1; x <= x2; x++) {
            let factor = 0
            if (x2 != x1) {
                factor = (x - x1) / (x2 - x1);
            }
            // color
            // GuaColor {r: 36.7732668329177, g: 153.65117206982544, b: 117.62483790523692, a: 255}
            // let color = a.color.interpolate(b.color, factor)
            let {position, color, uv} = a.interpolate(b, factor)
            // 如果有直接的颜色就用颜色画, 如果没有颜色就用贴图
            if (color != null) {
                color.r *= lightFactor
                color.g *= lightFactor
                color.b *= lightFactor
                this.drawPoint(position, color)
            } else if(this.image != null) {
                let {pixels, w, h} = this.image
                let {u, v} = uv
                let x = Math.abs(Math.floor((w - 1) * u))
                let y = Math.abs(Math.floor((h - 1) * v))
                let pixel = pixels[y][x]
                let [r, g, b, a] = pixel
                r = r * lightFactor
                g = g * lightFactor
                b = b * lightFactor
                let imageColor = GuaColor.new(r, g, b, a)
                this.drawPoint(position, imageColor)
            }

        }
    }
    drawLine(p1, p2, color=GuaColor.black()) {
        let [x1, y1, x2, y2, z1, z2] = [p1.x, p1.y, p2.x, p2.y, p1.z, p2.z]
        let dx = x2 - x1
        let dy = y2 - y1
        let R = (dx ** 2 + dy ** 2) ** 0.5
        let ratio = dx === 0 ? undefined : dy / dx
        let angle = 0
        if (ratio === undefined) {
            const p = Math.PI / 2
            angle = dy >= 0 ? p : -p
        } else {
            const t = Math.abs(dy / R)
            const sin = ratio >= 0 ? t : -t
            const asin = Math.asin(sin)
            angle = dx > 0 ? asin : asin + Math.PI
        }
        for (let r = 0; r <= R; r++) {
            const x = x1 + Math.cos(angle) * r
            const y = y1 + Math.sin(angle) * r
            let z = z1 + (z2 - z1) * (r / R) - 0.0001
            // let z = z1 + (z2 - z1) * (r / R) + 0.00000001
            this.drawPoint(GuaVector.new(x, y, z), color)
        }
    }
    drawTriangle(v1, v2, v3, lightFactor = 1) {
        let [a, b, c] = [v1, v2, v3].sort((va, vb) => va.position.y - vb.position.y)
        let middle_factor = 0
        if (c.position.y - a.position.y != 0) {
            middle_factor = (b.position.y - a.position.y) / (c.position.y - a.position.y)
        }
        // middle 是一个 Vertex
        let middle = a.interpolate(c, middle_factor)
        let start_y = a.position.y
        let end_y = b.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = a.interpolate(middle, factor)
            let vb = a.interpolate(b, factor)
            this.drawScanline(va, vb, lightFactor)
        }
        start_y = b.position.y
        end_y = c.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = middle.interpolate(c, factor)
            let vb = b.interpolate(c, factor)
            // log(va.position, vb.position)
            this.drawScanline(va, vb, lightFactor)
        }
    }
    // 实现一个 drawTriangle1(v1, v2, v3) 方法
    // v1 v2 v3 是一个三角形的三个顶点
    // 其中 v1 在上面，v2 v3 在下面，并且 v2 v3 的 y 是相同的
    drawTriangle1(v1, v2, v3) {
        let [a, b, c] = [v1, v2, v3].sort((va, vb) => va.position.y - vb.position.y)
        let middle_factor = 0
        if (c.position.y - a.position.y != 0) {
            middle_factor = (b.position.y - a.position.y) / (c.position.y - a.position.y)
        }
        // middle 返回过中间定点的横切线和斜边的交点
        let middle = a.interpolate(c, middle_factor)
        let start_y = a.position.y
        let end_y = b.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = a.interpolate(middle, factor)
            let vb = a.interpolate(b, factor)
            // log(va.position, vb.position)
            this.drawScanline(va, vb)
        }
    }
    drawTriangle2(v1, v2, v3) {
        // a, b, c 是 vertex 的实例
        let [a, b, c] = [v1, v2, v3].sort((va, vb) => vb.position.y - va.position.y)
        let middle_factor = 0
        if (c.position.y - a.position.y != 0) {
            middle_factor = (b.position.y - a.position.y) / (c.position.y - a.position.y)
        }
        let middle = a.interpolate(c, middle_factor)

        let start_y = b.position.y
        let end_y = a.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = a.interpolate(middle, factor)
            let vb = a.interpolate(b, factor)
            // log(va.position, vb.position)
            this.drawScanline(va, vb)
        }
    }
    project(coordVector, transformMatrix) {
        let {w, h} = this
        let [w2, h2] = [w/2, h/2]
        let point = transformMatrix.transform(coordVector.position)
        let x = point.x * w2 + w2
        let y = - point.y * h2 + h2
        let z = point.z
        let v = GuaVector.new(x, y, z)
        return GuaVertex.new(v, coordVector.color, coordVector.uv)
    }
    drawMesh(mesh) {
        let self = this
        // camera
        let {w, h} = this
        let {position, target, up} = self.camera
        const view = Matrix.lookAtLH(position, target, up)
        // field of view
        const projection = Matrix.perspectiveFovLH(0.8, w / h, 0.1, 1)

        // 得到 mesh 中点在世界中的坐标
        const rotation = Matrix.rotation(mesh.rotation)
        const translation = Matrix.translation(mesh.position)
        const world = rotation.multiply(translation)

        const transform = world.multiply(view).multiply(projection)

        for (let t of mesh.triangles) {
            // 拿到三角形的三个顶点
            let [p1, p2, p3] = t
            let a = GuaVertex.new(p1, GuaColor.red())
            let b = GuaVertex.new(p2, GuaColor.red())
            let c = GuaVertex.new(p3, GuaColor.red())
            // let [a, b, c] = t.map(i => mesh.vertices[i])
            // // 拿到屏幕上的 3 个像素点
            let [v1, v2, v3] = [a, b, c].map(v => self.project(v, transform))
            // 把这个三角形画出来
            self.drawTriangle(v1, v2, v3)
            self.drawLine(v1.position, v2.position)
            self.drawLine(v1.position, v3.position)
            self.drawLine(v2.position, v3.position)
        }
    }
    // 背面剔除
    isback(triangle, rotation) {
        let direction = this.camera.position.sub(this.camera.target)
        let [v1, v2, v3] = triangle
        let normal = GuaVector.core(v1.normal, v2.normal, v3.normal)
        normal = rotation.transform(normal)
        const cos = direction.cos(normal)
        return cos < 0
    }
    // 传入三角形和光源(向量), 计算光照夹角
    lighting(triangle, light, world){
        let [v1, v2, v3] = triangle

        // 求出三角形重心并转换为世界坐标系
        let position_core = GuaVector.core(v1.position, v2.position, v3.position)
        position_core = world.transform(position_core).normalize()

        // 求出三角形法向量并转换为世界坐标系
        let normal_core = GuaVector.core(v1.normal, v2.normal, v3.normal)
        normal_core = world.transform(normal_core).normalize()

        // 光线向量 = 三角形中点 - 光线位置
        let lightVector = this.light.sub(position_core).normalize()
        // 因为之前向量都做了归一化处理。所有向量长度为1，直接点乘即可。
        let angle = lightVector.dot(normal_core)
        // angle = Math.abs(angle)
        // cos可能为负，角度过大。设置最小光强
        let lightFactor = Math.max(0.1, angle)
        return lightFactor
    }
    drawMeshWithImage(mesh, image = null) {
        let self = this
        this.light = GuaVector.new(config.light_x.value, config.light_y.value, config.light_z.value)
        self.image = image
        // camera
        let {w, h} = this
        let {position, target, up} = self.camera
        const view = Matrix.lookAtLH(position, target, up)
        // field of view
        const projection = Matrix.perspectiveFovLH(0.8, w / h, 0.1, 1)

        // 得到 mesh 中点在世界中的坐标
        const rotation = Matrix.rotation(mesh.rotation)
        const translation = Matrix.translation(mesh.position)
        const world = rotation.multiply(translation)

        const transform = world.multiply(view).multiply(projection)

        for (let t of mesh.triangles) {
            const lightFactor = this.lighting(t, this.light, world)
            // 拿到三角形的三个顶点
            let [p1, p2, p3] = t
            // 如果没有 image, 默认给白色
            if(image == null) {
                let a = GuaVertex.new(p1.position, GuaColor.white())
                let b = GuaVertex.new(p2.position, GuaColor.white())
                let c = GuaVertex.new(p3.position, GuaColor.white())
                let [v1, v2, v3] = [a, b, c].map(v => self.project(v, transform))
                if(!this.isback(t, rotation)) {
                    self.drawTriangle(v1, v2, v3, lightFactor)
                }
            } else {
                // 拿到屏幕上的 3 个像素点
                let [v1, v2, v3] = [p1, p2, p3].map(v => self.project(v, transform))
                // 把这个三角形画出来
                if(!this.isback(t, rotation)) {
                    self.drawTriangle(v1, v2, v3, lightFactor)
                }
            }

        }
    }
    drawAxeImage(mesh) {
        let pixels = mesh.axeImage.pixels
        let int = Math.floor
        let imageWidth = mesh.axeImage.w
        let imageHeight = mesh.axeImage.h
        for (let i = 0; i < pixels.length; i++) {
            // let y = int(i / imageHeight)
            let line = pixels[i]
            for (let j = 0; j < line.length; j++) {
                let p = line[j]
                let [r, g, b, a] = p
                let color = GuaColor.new(r, g, b, a)
                let vector = GuaVector.new(j, i, 0)
                this.drawPoint(vector, color)
            }
        }
    }
    __debug_draw_demo() {
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 255
            a = 255
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }
}
