import React, { Component } from 'react'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
import '../styles/App.css'
import InputName from './InputName'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Query query={OPS_QUERY}>
            {props => {
              const { data, loading, error, refetch } = props
              if (loading) {
                return <div>Loading</div>
              }

              if (error) {
                return <div>An unexpected error occurred</div>
              }

              return (
                <div>
                  <p><b>Query for resource:</b></p>
                  <p><i>(Try rk043, VSI, 192.168, faisal, jz)</i></p>
                  <InputName
                    onSubmit={opsquerystr => {
                      refetch({
                        opsquerystr,
                      })
                    }}
                  />
                  <div id="opsresults" dangerouslySetInnerHTML={ {__html: data.opsquery }}></div>
                </div>
              )
            }}
          </Query>
        </div>
      </div>
    )
  }
}

const OPS_QUERY = gql`
  query OpsQuery($opsquerystr: String) {
    opsquery(opsquerystr: $opsquerystr)
  }
`

export default App
