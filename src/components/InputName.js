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
      <form onSubmit="this.props.onSubmit(this.state.opsquerystr)">
        <input
          type="text"
          value={this.state.opsquerystr}
          autofocus
          onChange={e => {
            this.setState({ opsquerystr: e.target.value })
          }}
          ref={(input) => { this.searchInput = input }}
        />
        <button
          type="submit"
          onClick={() => {
            this.props.onSubmit(this.state.opsquerystr)
          }}
        >
          Search
        </button>
      </form>
    )
  }

  componentDidMount(){
    this.searchInput.focus()
  }
}
