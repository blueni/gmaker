export function qs2params(qs = '') {
    qs = decodeURIComponent(qs)
    let index = qs.indexOf('?')
    if (index >= 0) {
        qs = qs.substring(index + 1)
    }
    let params = {}
    qs.split('&').forEach(item => {
        let arr = item.split('=')
        params[arr[0]] = arr[1]
    })
    return params
}