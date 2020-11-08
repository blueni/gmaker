import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { setBlog } from '../../store/actions'
import { useParams } from 'react-router'
import sdk from '../../scripts/sdk'
import './detail.less'

function getBlog(id) {
    return sdk.getDocDescription(id)
}

function getDetail(id) {
    return sdk.getDetail({ id })
}

function DetailPage(props) {
    let blog = props.blog
    let [detail, setDetail] = useState()
    let params = useParams()

    useEffect(async () => {
        if (!blog) {
            blog = await getBlog(params.id)
            props.dispatch(setBlog(blog))
        }

        if (!detail) {
            let detail = await getDetail(params.id)
            setDetail(detail)
            setTimeout(() => {
                editormd.markdownToHTML('md-viewer', {
                    previewCodeHighlight: false,
                    markdown: detail,
                })
            })
        }
    }, [])

    return (
        <div className="detail-page">
            <div className="page-content">
                {
                    blog &&
                    <h4 className="blog-title">
                        { blog.title }
                        <small>{ blog.stats.mtimeMs }</small>
                    </h4>
                }
                {
                    detail &&
                    <div className="doc-content" id="md-viewer">
                    </div>
                }
            </div>
        </div>
    )
}

export default connect((state) => {
    return {
        blog: state.blog,
    }
})(DetailPage)