import React, { Component } from 'react'
import { Segment, Header, Icon, Input} from 'semantic-ui-react'
class MessagesHeader extends Component {
    render() {
        const {isPrivateChannel , channelName ,numUniqueUsers , handleSearchChange , searchLoading } = this.props
        return (
            <Segment clearing>
                <Header floated='left' fluid='true' as='h2' style={{ bottomMargin : 0 }}>
                        <span>
                            { channelName }
                            {!isPrivateChannel && <Icon name='star outline' color='black'/>}
                        </span>
                     <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated='right'>
                    <Input 
                    name='serachItem'
                    onChange={handleSearchChange}
                    loading={searchLoading}
                    size="mini"
                    icon='search'
                    placeholder='Serach Messages'
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader
