import React from 'react'
import { Progress } from 'semantic-ui-react'
const ProgressBar = ({uploadState , percentUploaded}) => {
    return uploadState === 'uploading' && (
        <Progress 
        percent={percentUploaded}
        progress
        indicating
        size='medium'
        inverted
        className='progress_bar'
        />
    )
}

export default ProgressBar
