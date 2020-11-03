import React from 'react';
import { Grid } from 'semantic-ui-react'
import './App.css';
import ColorPanel from './ColorPanel/ColorPanel'
import SidePanel from './SidePanel/SidePanel'
import Messages from './Messages/Messages'
import MetaPanel from './MetaPanel/MetaPanel'
import { connect } from 'react-redux'

const App = ({ currentUser , currentChannel , isPrivateChannel})=>{
  return (
  <Grid columns='equal' className="app" style={{ background  : '#eee'}}>
      <ColorPanel />
      <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} />
      <Grid.Column  style ={{ marginLeft : 320}}>
          <Messages isPrivateChannel={isPrivateChannel} key={currentChannel && currentChannel.id} currentChannel={currentChannel} currentUser={currentUser}/>
      </Grid.Column>
      <Grid.Column width={4}> 
            <MetaPanel />
      </Grid.Column>
      
  </Grid>)
}

const mapStateToProps = (state)=>{
  return {
    currentUser : state.user.currentUser,
    currentChannel : state.channel.currentChannel,
    isPrivateChannel : state.channel.isPrivateChannel
  }
}

export default connect(mapStateToProps)(App);
