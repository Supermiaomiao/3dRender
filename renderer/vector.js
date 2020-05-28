class GuaVector extends GuaObject {
    // 表示二维向量的类
    constructor(x, y, z) {
        super()
        // 位置信息
        this.x = x
        this.y = y
        this.z = z
    }

    interpolate(other, factor) {
        let p1 = this
        let p2 = other
        let x = p1.x + (p2.x - p1.x) * factor
        let y = p1.y + (p2.y - p1.y) * factor
        // 增加z的插值计算
        let z = p1.z + (p2.z - p1.z) * factor
        return GuaVector.new(x, y, z)
    }
    sub(v) {
        let x = this.x - v.x
        let y = this.y - v.y
        let z = this.z - v.z
        return GuaVector.new(x, y, z)
    }
    // 归一化: 向量方向不变, 但长度变为1
    normalize() {
        let l = this.length()
        if (l == 0) {
            return this
        }
        let factor = 1 / l

        return this.multi_num(factor)
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    multi_num(n) {
        return GuaVector.new(this.x * n, this.y * n, this.z * n)
    }
    // 求三角形法向量和中心点都用该方法
    // 求法向量输入为顶点法向量, 中心点输入为顶点坐标
    static core(p1, p2, p3) {
         let x = (p1.x + p2.x + p3.x) / 3
         let y = (p1.y + p2.y + p3.y) / 3
         let z = (p1.z + p2.z + p3.z) / 3
         return GuaVector.new(x, y, z)
    }
    cross(v) {
        let x = this.y * v.z - this.z * v.y
        let y = this.z * v.x - this.x * v.z
        let z = this.x * v.y - this.y * v.x
        return GuaVector.new(x, y, z)
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
    // 求两个三维向量的 cos(angle) 值
    cos(v) {
        return this.dot(v) / this.length() * v.length()
    }
}
