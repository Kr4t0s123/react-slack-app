import React, { Component } from 'react'
import { Grid, Header, Button, Segment, Message, Icon, Form} from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from '../../firebase'
import md5 from 'md5'
class Register extends Component {

    state = {
        username : '',
        email : '',
        password : '',
        passwordConfirmation : '',
        errors : [],
        loading : false,
        usersRef : firebase.database().ref('users')
    }
    handleChange = (e) =>{
        this.setState({
        [e.target.name] : e.target.value
        })
    }
    

    isFormValid = () =>{
        let errors = [];
        let error; 
        if(this.isFormEmpty(this.state)) {
            error = { message : 'Fill in all fields'}
            errors.push(error);
            this.setState({errors : errors})
            return false;
        } else if(!this.isPasswordValid(this.state)) {
            error = { message : 'Password is invalid'}
            errors.push(error);
            this.setState({errors : errors})
            return false;
        } else {
            return true;
        }
    }

    isPasswordValid = ({ password , passwordConfirmation}) =>{
        if(password.length < 6 || passwordConfirmation.length < 6){
            return false
        } else if(password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }
    }

    isFormEmpty =({username , password , email ,passwordConfirmation}) =>{
        return !username.length || !password.length || !email.length || !passwordConfirmation.length
    }

    displayErrors =(errors)=>{
        return errors.map((error,i) => <p key={i}>{error.message}</p>)
    }

    handleSubmit = (e) =>{
        e.preventDefault();
        if(this.isFormValid()){
        this.setState({ errors : [] , loading : true})
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email , this.state.password)
            .then(createdUser =>{
                    console.log(createdUser)
                    createdUser.user.updateProfile({
                        displayName : this.state.username,
                        photoURL : `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                    .then(()=>{
                        this.saveUser(createdUser).then(()=>{ 
                            // this.setState({ loading : false})
                            console.log('user saved')
                        })
                    })
                    .catch(err =>{
                        console.error(err);
                        this.setState({
                            errors : this.state.errors.concat(err),
                            loading : false
                        })
                    })
                    
            })
            .catch(err =>{
                console.error(err)

                this.setState({errors : this.state.errors.concat(err), loading : false})

            })
        }
    }
    saveUser =(createdUser)=>{
        return this.state.usersRef.child(createdUser.user.uid).set({
             name : createdUser.user.displayName,
             avatar : createdUser.user.photoURL
        })
    }

    handleInputError = (errors, Inputname) =>{
        return errors.some(error =>{
          return error.message.toLowerCase().includes(Inputname);
        })
    }
    render(){
        const { username , email , password ,passwordConfirmation ,errors , loading} = this.state
        return(
            <Grid textAlign="center" verticalAlign='middle' className="app">
                <Grid.Column style={{ maxWidth : 450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name='puzzle piece' color='orange'/>
                        Register for DevChat
                    </Header>
                    { errors.length > 0 && 
                            <Message error>
                                {this.displayErrors(errors)}
                            </Message>
                    }
                    <Form onSubmit={this.handleSubmit} size='large'>
                        <Segment stacked>  
                            <Form.Input error={this.handleInputError(errors,'username')} value={username} type="text" fluid name="username" icon='user' iconPosition='left' placeholder='Username' onChange={this.handleChange}/>
                            <Form.Input error={this.handleInputError(errors,'email')} value={email} type="email" fluid name="email" icon='mail' iconPosition='left' placeholder='Email Address' onChange={this.handleChange}/>
                            <Form.Input error={this.handleInputError(errors,'password')} value={password} type="password" fluid name="password" icon='lock' iconPosition='left' placeholder='Password' onChange={this.handleChange}/>
                            <Form.Input error={this.handleInputError(errors,'password')} value={passwordConfirmation} type="password" fluid name="passwordConfirmation" icon='repeat' iconPosition='left' placeholder='Password Confirmation' onChange={this.handleChange}/>
                            <Button disabled={loading} loading={loading} color='orange' fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;
