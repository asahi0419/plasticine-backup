var buildDocumentByTemplParams = []

export const getLatestParam = (params = []) => {
    if ( params.length === 0 ) {
        return null
    }
    return params.reduce(function(prev, current) {
        switch (true) {
            case (!prev.executed && !current.executed):
                return (prev.timestamp > current.timestamp) ? prev : current
            case !prev.executed:
                return prev
            case !current.executed:
                return current
            default:
                return current
        }
    })
}

export default buildDocumentByTemplParams