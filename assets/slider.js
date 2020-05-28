if (!window._e) {
    window._e = document.querySelector.bind(document)
}
if (!window._ce) {
    window._ce = document.createElement.bind(document)
}

class Slider {
    static new(...args) {
        return new this(...args)
    }

    /**
     * 
     * @param {string} selector 
     * @param {object} options 选项
     * @param {number} options.min 最小值
     * @param {number} options.max 最大值
     * @param {number=} options.value 初始值，默认为 min 的值
     * @param {number=} options.width 宽度，默认 300
     * @param {string} options.title 标题
     * @param {boolean=} options.persist 是否要持续触发事件监听
     */
    constructor(selector, options) {
        let { min, max, value = min } = options
        if (value < min) {
            value = min
        } else if (value > max) {
            value = max
        }

        this.handlers = {}
        this.options = {
            width: 100,
            step: 0.1,
            ...options,
            value,
        }
        this.attach(selector)
    }

    attach(selector = 'body') {
        let ctn = _e(selector)
        let { title } = this.options

        /** @type {HTMLElement} */
        let wrapper = _ce('div')
        wrapper.className = 'slider'
        wrapper.insertAdjacentHTML('beforeend', `
            <div class="text">
                <div class="value"></div>
                <div class="title">${title}</div>
            </div>
            <div class="main">
                <div class="outer">
                    <div class="inner">
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        `)

        this.bindEvents(wrapper)

        ctn.appendChild(wrapper)
    }

    bindEvents(el) {
        let e = el.querySelector.bind(el)
        let inner = e('.inner')
        let dot = e('.dot')
        let { min, max, value, width, persist, step } = this.options

        el.style.width = `${width}px`
        let maxOffset = width

        // 用开关来表示是否可以移动, 可以按下开关的时候才能移动
        let moving = false

        // 范围总值
        let total = max - min
        // 初始偏移量
        let offset = 0
        // slider 的值显示的地方
        let result = e('.value')
        // 一个单位数值的偏移量
        let unit = width / total

        const updateValue = (value, publish) => {
            let percentage = value / total
            inner.style.width = String(percentage * 100) + '%'

            let actualValue = (value + min).toFixed(1)
            // 更新界面显示的数值
            result.innerHTML = actualValue

            if (publish) {
                // 发布事件
                this.trigger(Slider.events.CHANGE, actualValue)
            }
        };

        // 根据初始值更新滑条的进度
        updateValue(value - min)

        const updateByOffset = (x, publish) => {

            // dot 距离有一个范围, 即 0 < x < maxOffset
            if (x > maxOffset) {
                x = maxOffset
            }
            if (x < 0) {
                x = 0
            }

            x = parseFloat((x / unit).toFixed(1))
            
            updateValue(x, publish)
        }

        dot.addEventListener('mousedown', (event) => {
            // event.clientX 是浏览器窗口边缘到鼠标的距离
            // dot.offsetLeft 是 dot 元素左上角到父元素左上角的距离
            // offset 就是父元素距离浏览器窗口边缘的距离, 注意这个值基本上是不变的
            offset = event.clientX - dot.offsetLeft - dot.offsetWidth / 2
            moving = true
        })

        document.addEventListener('mouseup', (event) => {
            if (!persist && moving) {
                // 离浏览器左侧窗口当前距离减去父元素距离浏览器左侧窗口距离就是
                // dot 移动的距离
                updateByOffset(event.clientX - offset, true)
            }
            moving = false
        })

        document.addEventListener('mousemove', (event) => {
            if (moving) {
                updateByOffset(event.clientX - offset, persist)
            }
        })
    }

    trigger(eventName, ...args) {
        let hs = this.handlers[eventName]
        if (hs) {
            for (let handler of hs) {
                handler(...args)
            }
        }
    }

    on(eventName, fn) {
        let hs = this.handlers
        hs[eventName] = hs[eventName] || []
        hs[eventName].push(fn)
        return this
    }
}

Slider.events = {
    CHANGE: 'change',
}
