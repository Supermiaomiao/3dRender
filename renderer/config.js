const config = {
    camera_position_x: {
        value: 0,
        title: 'Camera Position X',
        max: 10,
        min: -10,
    },
    camera_position_y: {
        value: 0,
        title: 'Camera Position Y',
        max: 10,
        min: -10,
    },
    camera_position_z: {
        value: 10,
        title: 'Camera Position Z',
        max: 10,
        min: -10,
    },
    camera_target_x: {
        value: 0,
        title: 'Camera Target X',
        max: 10,
        min: -10,
    },
    camera_target_y: {
        value: 1,
        title: 'Camera Target Y',
        max: 10,
        min: -10,
    },
    camera_target_z: {
        value: 0,
        title: 'Camera Target Z',
        max: 10,
        min: -10,

    },
    camera_up_x: {
        value: 0,
        title: 'Camera Up X',
        max: 10,
        min: -10,
    },
    camera_up_y: {
        value: 1,
        title: 'Camera Up Y',
        max: 10,
        min: -10,

    },
    camera_up_z: {
        value: 0,
        title: 'Camera Up Z',
        max: 10,
        min: -10,

    },
    rotation_x: {
        value: 0,
        title: 'Rotation X',
        max: 10,
        min: -10,

    },
    rotation_y: {
        value: 1.5,
        title: 'Rotation Y',
        max: 10,
        min: -10,
    },
    rotation_z: {
        value: 0,
        title: 'Rotation Z',
        max: 10,
        min: -10,
    },
    light_x: {
        value: -2,
        title: '光照点x',
        max: 10,
        min: -10,
    },
    light_y: {
        value: 0,
        title: '光照点y',
        max: 10,
        min: -10,
    },
    light_z: {
        value: 4,
        title: '光照点z',
        max: 10,
        min: -10,
    },
}
const initSliders = () => {
    const sliders = []
    for (let [k, v] of Object.entries(config)) {
        let s = Slider.new('.config', {
            min: v.min,
            max: v.max,
            value: v.value,
            title: v.title,
            persist: true,
        })
        s.on('change', (value) => {
            config[k].value = value
        })
        sliders.push(s)
    }
}
