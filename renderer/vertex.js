class Image extends GuaObject {
    constructor(u, v) {
        super()
        this.u = u
        this.v = v
    }
    interpolate(other, factor) {
        let p1 = this
        let p2 = other
        let u = p1.u + (p2.u - p1.u) * factor
        let v = p1.v + (p2.v - p1.v) * factor
        return Image.new(u, v)
    }
}

class GuaVertex extends GuaObject {
    // 表示顶点的类, 包含 GuaVector 和 GuaColor
    // 表示了一个坐标和一个颜色
    constructor(position, color=null, uv, normal=null) {
        super()
        this.position = position
        this.color = color
        this.uv = uv
        this.normal = normal    // normal 是 vector 实例
    }
    interpolate(other, factor) {
        let a = this
        let b = other
        let p = a.position.interpolate(b.position, factor)
        let c = a.color != null ? a.color.interpolate(b.color, factor) : null
        let uv = a.uv !=null ? a.uv.interpolate(b.uv, factor) : null
        return GuaVertex.new(p, c, uv)
    }
}
