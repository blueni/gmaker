import React from 'react'
import './loading.component.less'

export default function Loading(props) {
    let arr = Array.from({ length: 8 })
    let {
        // 值可以为 rotate, translate, scale, skew, opacity
        animate = 'scale',
        width = '10px',
        height = '30px',
    } = props

    return (
    <div className="g-loading g-loading-1">
        <div className="block-content">
            {
            arr.map((value, index) => (
                <div 
                    className={`block block${index + 1} g-animate-${animate}`}
                    key={index}
                    style={ { width, height, } }
                >
                </div>
            ))
            }
        </div>
    </div>
    )
}