import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './Components/App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router , Switch , Route , withRouter } from 'react-router-dom'
import Login from './Components/Auth/Login'
import Register from './Components/Auth/Register'
import 'semantic-ui-css/semantic.min.css'
import firebase from './firebase'
import { createStore } from 'redux'
import { Provider , connect } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootRudecer from './reducers';
import { setUser , clearUser} from './actions/index'
import Spinner from './Spinner'

const store = createStore(rootRudecer , composeWithDevTools());

class Root extends Component{
    
    componentDidMount(){
        console.log(this.props.isLoading)
        firebase.auth().onAuthStateChanged(user => {
            if(user){
                this.props.setUser(user)
                this.props.history.push('/')
            } else {
                this.props.clearUser()
                this.props.history.push('/login')
            }
        })
    }
    render(){
    return ( this.props.isLoading ? <Spinner/> :
   
        <Switch>
            <Route path="/" exact component={App}/>
            <Route path="/register" component={Register}/>
            <Route path="/login" component={Login}/>
        </Switch>);
    }
}

const mapStateToProps = (state) =>{
    return {
        isLoading : state.user.isLoading
    }
}

const RootWithAuth = withRouter(connect( mapStateToProps , { setUser , clearUser })(Root));


ReactDOM.render( 
<Provider store={store}>
    <Router>
         <RootWithAuth/>
    </Router>
</Provider>,
 document.getElementById('root'));
registerServiceWorker();
