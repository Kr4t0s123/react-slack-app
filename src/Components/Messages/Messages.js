import React, { Component } from 'react'
import { Segment, Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'
import firebase from '../../firebase'
class Messages extends Component {
    
    state = {
        privateChannel : this.props.isPrivateChannel,
        messagesRef : firebase.database().ref('messages'),
        channel : this.props.currentChannel,
        user : this.props.currentUser,
        messages : [],
        messagesLoading : true,
        numUniqueUsers : '',
        searchTerm : '',
        searchLoading : false,
        searchResults : [],
        privateMessagesRef : firebase.database().ref('privateMessages'),
        isChannelStarred : false,
        usersRef : firebase.database().ref('users')
    }
    
    componentDidMount(){
         const { channel , user} = this.state
         if( channel && user) {
             this.addListeners(channel.id)
             this.addUserStarsListener(channel.id,user.uid)
         }
    }

    addUserStarsListener=(channelId , userId)=>{
        this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data =>{
            if(data.val() !== null) {
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId)
                this.setState({ isChannelStarred : prevStarred })
            }
        })
    }

    handleStar = ()=>{
        this.setState({ isChannelStarred : !this.state.isChannelStarred} , ()=>this.starChannel())
    }

    starChannel=()=>{
        if(this.state.isChannelStarred) {
           this.state.usersRef.child(`${this.state.user.uid}/starred`)
           .update({
               [this.state.channel.id] : {
                   name : this.state.channel.name,
                   details : this.state.channel.details,
                   createdBy : {
                       name : this.state.channel.createdBy.name,
                       avatar : this.state.channel.createdBy.avatar
                   }
               }
           })
        } else {
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err=>{
                if(err !== null)
                 {
                     console.error(err)
                 }
            })
        }
    }

    getMessagesRef =()=>{
        const { messagesRef , privateMessagesRef , privateChannel} = this.state
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    addListeners = channelId =>{
         this.addMessageListener(channelId)

    }

    addMessageListener = channelId =>{
        let loadMessages = []
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added' , snap =>{
            loadMessages.push(snap.val())
            this.setState({
                messages : loadMessages,
                messagesLoading : false
            })
           this.countUniqueUsers(loadMessages);
        })

    }
    countUniqueUsers =(messages)=>{
        const uniqueUsers  = messages.reduce((acc , message)=>{
            if(!acc.includes(message.user.name))
            {
                acc.push(message.user.name)
            }
            return acc;
        },[])
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${ plural ? 's' : ''}`
        this.setState({ numUniqueUsers })
    }
    displayMessages=(messages)=>{
       return messages.length > 0 && messages.map( message => 
                <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
                />
            )
    }


    handleSearchChange=(e)=>{
        this.setState({ searchTerm : e.target.value , searchLoading : true } ,()=>{
            this.handleSearchMessages()
        })
    }
    handleSearchMessages=()=>{
        const channelMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm , 'gi');
        const searchResults = channelMessages.reduce((acc , message)=>{

            if((message.content && message.content.match(regex)) || (message.user.name &&  message.user.name.match(regex)))
            {
                acc.push(message)
            }
            return acc;
        } , [])

        this.setState({ searchResults })
        setTimeout(()=>this.setState({ searchLoading : false}) , 1000) 
    }

    displayChannelName = (channel) => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }
    render() {
        const {isChannelStarred, searchLoading , messagesRef , channel , user , messages , numUniqueUsers ,searchTerm ,searchResults , privateChannel} = this.state
        return (
           <React.Fragment>
               <MessagesHeader handleStar={this.handleStar} isChannelStarred={isChannelStarred}  isPrivateChannel={privateChannel} searchLoading={searchLoading} handleSearchChange={this.handleSearchChange} channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers} />

               <Segment>
                    <Comment.Group className='messages'>
                    {searchTerm ? this.displayMessages(searchResults): this.displayMessages(messages)}
                    </Comment.Group>
               </Segment>

            <MessageForm getMessagesRef={this.getMessagesRef} isPrivateChannel={privateChannel} messagesRef={messagesRef} currentChannel={channel} currentUser={user}/>
           </React.Fragment>
        )
    }
}  

export default Messages
