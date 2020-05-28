class GuaColor extends GuaObject {
    // 表示颜色的类
    constructor(r, g, b, a) {
        super()
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    interpolate(other, factor) {
        let c1 = this
        let c2 = other
        let r = c1.r + (c2.r - c1.r) * factor
        let g = c1.g + (c2.g - c1.g) * factor
        let b = c1.b + (c2.b - c1.b) * factor
        let a = c1.a + (c2.a - c1.a) * factor
        return GuaColor.new(r, g, b, a)
    }
    static mix(c1, c2) {
        //r g b a
        // log('颜色', c1 ,c2)
        let alpha1 = c1.a / 255
        let alpha2 = c2.a / 255
        let alpha = 1 - (1 - alpha1) * ( 1 - alpha2)
        if(alpha != 1) {
            log("alpha", alpha)
        }
        let r1 = c1.r
        let g1 = c1.g
        let b1 = c1.b

        let r2 = c2.r
        let g2 = c2.g
        let b2 = c2.b

        let r = (1 - alpha) * r2 + alpha * r1
        let g = (1 - alpha) * g2 + alpha * g1
        let b = (1 - alpha) * b2 + alpha * b1
        // log('颜色计算', r, g, b)
        // log('新颜色', )
        return GuaColor.new(r, g, b, alpha * 255)
    }
    // 常见的几个颜色
    static black() {
        return this.new(0, 0, 0, 255)
    }
    static white() {
        return this.new(255, 255, 255, 255)
    }
    static red() {
        return this.new(255, 0, 0, 255)
    }
    static green() {
        return this.new(0, 255, 0, 255)
    }
    static blue() {
        return this.new(0, 0, 255, 255)
    }
}
