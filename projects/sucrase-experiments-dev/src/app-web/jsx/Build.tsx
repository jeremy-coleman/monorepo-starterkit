import React, { Component } from 'react'
import classNames from 'clsx'

export let Build = ({ selectBuild, deleteBuild, pathname, currentPathname, basename, ...props }) => {
  const _selectBuild = () => selectBuild(pathname)
  const _deleteBuild = () => deleteBuild(pathname)

  //const selectedBuild = props.currentPathname === props.pathname;
  const selectedBuild = Object.is(currentPathname, pathname)

  const headClassNames = classNames('btn btn-default btn-sm', { 'btn-info': selectedBuild })
  const tailClassNames = classNames('btn btn-default btn-sm dropdown-toggle', { 'btn-info': selectedBuild })

  return (
    <div className="btn-group">
      <a href="#" className={headClassNames} onClick={_selectBuild}>
        <i className="fa fa-folder-open"></i> {basename}
      </a>
      <a href="#" className={tailClassNames} onClick={_deleteBuild}>
        <i className="fa fa-times"></i>
      </a>
    </div>
  )
}

export default Build

// export default class Build extends Component {
// 	constructor (props) {
// 		super(props);

// 		this.selectBuild = () => {
// 			this.props.selectBuild(this.props.pathname);
// 		}

// 		this.deleteBuild = () => {
// 			this.props.deleteBuild(this.props.pathname);
// 		};
// 	}

// 	render () {
// 		const selectedBuild = this.props.currentPathname === this.props.pathname;
// 		const headClassNames = classNames('btn btn-default btn-sm', {'btn-info': selectedBuild});
// 		const tailClassNames = classNames('btn btn-default btn-sm dropdown-toggle', {'btn-info': selectedBuild});

// 		return (
// 			<div className="btn-group">
// 				<a href="#" className={headClassNames} onClick={this.selectBuild}><i className="fa fa-folder-open"></i> {this.props.basename}</a>
// 				<a href="#" className={tailClassNames} onClick={this.deleteBuild}><i className="fa fa-times"></i></a>
// 			</div>
// 		);
// 	}
// }
