import React, { Component } from 'react'
import { Grid, Header, Button, Segment, Message, Icon, Form} from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from '../../firebase'
class Login extends Component {

    state = {
        email : '',
        password : '',
        errors : [],
        loading : false,
    }
    handleChange = (e) =>{
        this.setState({
        [e.target.name] : e.target.value
        })
    }
 
    displayErrors =(errors)=>{
        return errors.map((error,i) => <p key={i}>{error.message}</p>)
    }

    handleSubmit = (e) =>{
        e.preventDefault();
        if(this.isFormValid(this.state)){
         this.setState({ errors : [] , loading : true})
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email , this.state.password)
                .then( signedInUser =>{
                    console.log(signedInUser)
                })
                .catch(err =>{
                    console.error(err)
                    this.setState({
                        errors : this.state.errors.concat(err),
                        loading : false
                    })
                })
        }
    }
    isFormValid =({ email , password})=>{
        return email && password;
    }

    handleInputError = (errors, Inputname) =>{
        return errors.some(error =>{
          return error.message.toLowerCase().includes(Inputname);
        })
    }
    render(){
        const {  email , password, errors , loading} = this.state
        return(
            <Grid textAlign="center" verticalAlign='middle' className="app">
                <Grid.Column style={{ maxWidth : 450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name='code branch' color='violet'/>
                        Login to DevChat
                    </Header>
                    { errors.length > 0 && 
                            <Message error>
                                {this.displayErrors(errors)}
                            </Message>
                    }
                    <Form onSubmit={this.handleSubmit} size='large'>
                        <Segment stacked>  
                           
                            <Form.Input error={this.handleInputError(errors,'email')} value={email} type="email" fluid name="email" icon='mail' iconPosition='left' placeholder='Email Address' onChange={this.handleChange}/>
                            <Form.Input error={this.handleInputError(errors,'password')} value={password} type="password" fluid name="password" icon='lock' iconPosition='left' placeholder='Password' onChange={this.handleChange}/>
                          
                            <Button disabled={loading} loading={loading} color='violet' fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;
