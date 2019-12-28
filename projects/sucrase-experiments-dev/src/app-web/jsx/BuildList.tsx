import React from 'react'
import path from 'path'
import { Build } from './Build'
import { AddBuild } from './AddBuild'

export const BuildList = props => {
  localStorage.setItem('recentList', JSON.stringify(props.pathnameList))

  return (
    <div className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-collapse collapse">
          <div id="buildList" className="nav navbar-nav navbar-overflow">
            {props.pathnameList.map((pathname, index) => (
              <Build
                pathname={pathname}
                basename={path.basename(pathname)}
                currentPathname={props.currentPathname}
                selectBuild={props.selectBuild}
                deleteBuild={props.deleteBuild}
                key={index}
              />
            ))}
            <AddBuild addBuild={props.addBuild} pathnameList={props.pathnameList} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildList

// export class BuildList extends Component {
// 	constructor (props) {
// 		super(props);
// 	}
// 	componentDidUpdate () {
// 		localStorage.setItem('recentList', JSON.stringify(this.props.pathnameList));
// 	}
// 	render () {
// 		return (
// 			<div className="navbar navbar-default navbar-fixed-top">
// 				<div className="container">
// 					<div className="navbar-collapse collapse">
// 						<div id="buildList" className="nav navbar-nav navbar-overflow">
// 							{this.props.pathnameList.map((pathname, index) =>
// 								<Build
// 									pathname={pathname}
// 									basename={path.basename(pathname)}
// 									currentPathname={this.props.currentPathname}
// 									selectBuild={this.props.selectBuild}
// 									deleteBuild={this.props.deleteBuild}
// 									key={index}
// 								/>
// 							)}
// 							<AddBuild
// 								addBuild={this.props.addBuild}
// 								pathnameList={this.props.pathnameList}
// 							/>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}
//}
