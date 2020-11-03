import React, { Component } from 'react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import { Segment, Button, Input} from 'semantic-ui-react'
class MessageForm extends Component {

    state = {
        message : '',
        loading : false,
        channel : this.props.currentChannel,
        user : this.props.currentUser,
        errors : [],
        modal : false,
        uploadState : '',
        uploadTask : null,
        storageRef : firebase.storage().ref(),
        percentUploaded : 0
    }
    handleChange=(e)=>{
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    openModal=()=>{
        this.setState({ modal : true})
    }

    closeModal=()=>{
        this.setState({ modal : false})
    }

    createMessage= (fileUrl = null) =>{
        const message = {
           
            timestamp : firebase.database.ServerValue.TIMESTAMP,
            user : {
                id : this.state.user.uid,
                name : this.state.user.displayName,
                avatar : this.state.user.photoURL
            }
        }

        if(fileUrl !== null){
            message['image'] = fileUrl
        } else {
            message['content'] = this.state.message
        }
        return message
    }

    getPath=()=>{
        if(this.props.isPrivateChannle) {
            return `chat/private-${this.state.channel.id}`
        } else {
            return 'chat/public'
        }
    }
    uploadFile=(file , metadata)=>{
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef()
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`
        console.log(this.state.storageRef)
        this.setState({
            uploadState : 'uploading',
            uploadTask : this.state.storageRef.child(filePath).put(file , metadata)
        } , ()=>{
            this.state.uploadTask.on('state_changed' , snap=> {
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100)
                this.setState({ percentUploaded })
            } ,
            err =>{
                console.error(err)
                this.setState(
                    {
                        errors : this.state.errors.concat(err),
                        uploadState : 'error',
                        uploadTask : null
                    }
                )
            }, ()=>{
                this.state.uploadTask.snapshot.ref.getDownloadURL()
                .then( downloadurl =>{
                    this.sendFileMessage(downloadurl, ref , pathToUpload)
                })
                .catch( err =>{ 
                    console.error(err)
                    this.setState(
                        {
                            errors : this.state.errors.concat(err),
                            uploadState : 'error',
                            uploadTask : null
                        }
                    )
                })
            })
        })
    }

   

    sendFileMessage=(fileUrl , ref , pathToUpload)=>{
        ref.child(pathToUpload).push().set(this.createMessage(fileUrl)).then(()=>{
            this.setState({ uploadState : 'done'})
        })
        .catch(err =>{
            console.error(err)
            this.setState({ errors : this.state.errors.concat(err) })
        })
    }

    sendMessage=()=>{
        const { getMessagesRef } = this.props
        const { message} = this.state
        const { channel } = this.state
        if(message) {
            this.setState({ loading : true })
            getMessagesRef().child(channel.id).push()
                .set(this.createMessage())
                .then(()=>{
                    this.setState({ loading : false , message : '' , errors : []})
                })
                .catch(err =>{
                    this.setState({ loading : false , errors : this.state.errors.concat(err)})
                })                               
        } else {
            this.setState({
                errors : this.state.errors.concat({ message : 'Add a message'})
            })
        }
    }
    render() {
        const { errors , message , loading , modal , percentUploaded , uploadState} = this.state
        return (
            <Segment className="message__form" >
                <Input 
                    fluid
                    onChange={this.handleChange}
                    name='message'
                    value={message}
                    style={{ marginBottom : "0.7em"}}
                    label={<Button icon='add' />}
                    error={
                        errors.some(error => error.message.includes('message'))
                    }
                    placeholder='Type a message'
                />
                <Button.Group icon widths='2'>
                    <Button
                        color='orange'
                        disabled={loading}
                        content='Add Reply'
                        labelPosition='left'
                        icon='edit'
                        onClick={this.sendMessage}
                    />
                    <Button 
                     color='teal'
                     disabled={uploadState === 'uploading'}
                     labelPosition='right'
                     content='Upload Media'
                     icon='cloud upload'
                     onClick={this.openModal}
                    />
                    
                </Button.Group>
                <FileModal modal={modal} closeModal={this.closeModal} uploadFile={this.uploadFile} />
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
            </Segment>
        )
    }
}

export default MessageForm
