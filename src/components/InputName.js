import React, { Component } from 'react'

export default class InputName extends Component {
  constructor(props) {
    super(props)

    this.state = {
      opsquerystr: '',
    }
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.opsquerystr}
          onChange={e => {
            this.setState({ opsquerystr: e.target.value })
          }}
        />
        <button
          onClick={() => {
            this.props.onSubmit(this.state.opsquerystr)
          }}
        >
          Send
        </button>
      </div>
    )
  }
}
