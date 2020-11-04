import React, { Component } from 'react'
import { Icon, Menu , Modal ,Form , Input, Button ,Label } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { setCurrentChannel , setPrivateChannel } from '../../actions/index'
import firebase from '../../firebase'
class Channels extends Component {
    state = {
        user : this.props.currentUser,
        channels : [],
        model : false,
        channelName : '',
        channelDetails : '',
        channelsRef : firebase.database().ref('channels'),
        firstLoad : true,
        activeChannel : '',
        channel : null,
        messagesRef : firebase.database().ref('messages'),
        notifications : []
    }

    componentDidMount(){
        this.addListeners()
    }

    componentWillUnmount(){
        this.state.channelsRef.off("child_added")
    }

    addListeners=()=>{
        let loadedChannels=[]
        this.state.channelsRef.on('child_added', snap =>{
            loadedChannels.push(snap.val())
            this.setState({ channels : loadedChannels},()=> this.setFirstChannel())
            this.addNotificationListener(snap.key);
        })
    }
    addNotificationListener=(channelId)=>{
        this.state.messagesRef.child(channelId).on('value' , snap=>{
            if(this.state.channel){
                this.handleNotifications(channelId , this.state.channel.id , this.state.notifications , snap)
            }
        })
    }

    handleNotifications=(channelId , currentChannelId , notifications , snap)=>{
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId)

        if(index !== -1){
            if( channelId !== currentChannelId) {
                lastTotal = notifications[index].total

                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        } else {
            notifications.push({
                id : channelId,
                total : snap.numChildren(),
                lastKnownTotal : snap.numChildren(),
                count : 0
            })
        }

        this.setState({ notifications : notifications })
    }

    setFirstChannel=()=>{
        const { firstLoad, channels}  = this.state
        if(firstLoad && channels.length > 0) {
            this.props.setCurrentChannel(channels[0])    
            this.setState({ activeChannel : channels[0].id})
            this.setState({ channel : channels[0]})
        }   

        this.setState({ firstLoad  : false})
    }

    closeModel=()=> this.setState({ model : false })
    openModal=()=>this.setState({ model : true })
    handleChange=(e)=>{
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    isFormValid=({ channelName , channelDetails})=>{
        return channelDetails && channelName;
    }

    addChannel=()=>{
        const { channelsRef , channelName , channelDetails , user } = this.state
        
        const key = channelsRef.push().key;

        const newChannel = {
            id : key,
            name : channelName,
            details : channelDetails,
            createdBy : {
                name : user.displayName,
                avatar : user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(()=>{
                this.setState({
                    channelName : '',
                    channelDetails : ''
                })
                this.closeModel()
                console.log('channel added')
            })
            .catch((err)=>{
                console.error(err)
            })
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        if(this.isFormValid(this.state)) {
            this.addChannel()
        }
    }
    changeChannel=(channel)=>{
        this.setState({ activeChannel : channel.id})
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false) 
        this.setState({ channel })
    }

    clearNotifications=()=>{
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)
        if(index !== -1)
        {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({ notifications : updatedNotifications})
        } 
    }

    getNotificationCount=(channel)=>{
        let count = 0;
        this.state.notifications.forEach(notification =>{
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if(count > 0) return count;
    }

    
    displayChannles=(channels)=>(
        channels.length > 0 && channels.map(channel => 
            <Menu.Item 
            key={channel.id}
            name={channel.name} 
            style={{ opacity : 0.7}}
            onClick={()=>this.changeChannel(channel)}
            active={ this.state.activeChannel === channel.id}
            >
                {this.getNotificationCount(channel) && (
                    <Label color='red'>{this.getNotificationCount(channel)}</Label>
                )}
                # { channel.name} 
            </Menu.Item>
            )
    )

    render() {
         const { channels , model} = this.state
        return (
            <React.Fragment>
            <Menu.Menu className='menu'>
               <Menu.Item>
                    <span>
                        <Icon name='exchange'/> CHANNELS
                    </span>{' '}
                    ({channels.length})<Icon name='add' onClick={this.openModal}/>
               </Menu.Item>
               {this.displayChannles(channels)}
           </Menu.Menu>
           <Modal basic open={model} onClose={this.closeModel}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Field>
                            <Input fluid label='Name of Channel' name='channelName' onChange={this.handleChange}/>
                        </Form.Field>
                        <Form.Field>
                            <Input fluid label='About the Channle' name='channelDetails' onChange={this.handleChange}/>
                        </Form.Field>
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSubmit}>
                        <Icon name='checkmark'/> Add
                    </Button>
                    <Button color="red" inverted onClick={this.closeModel}>
                        <Icon name='remove'/> Cancel
                    </Button>
                </Modal.Actions>
           </Modal>

            </React.Fragment>
     
        )
    }
}

export default connect(null , { setCurrentChannel , setPrivateChannel })(Channels)
