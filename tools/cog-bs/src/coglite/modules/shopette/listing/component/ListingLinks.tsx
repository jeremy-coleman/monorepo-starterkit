import { IListingModel } from "coglite/types"
import { observer } from "mobx-react"
import { Link } from "@uifabric/components"
import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

interface IListingLinksProps {
  listing: IListingModel
}

@observer
class ListingLinks extends React.Component<IListingLinksProps, any> {
  render() {
    const links = this.props.listing.doc_urls
    let content
    if (links && links.length > 0) {
      content = links.map((link) => {
        return (
          <div key={link.name + link.url}>
            <Link href={link.url} target={link.name}>
              {link.name}
            </Link>
          </div>
        )
      })
    } else {
      content = <MessageBar messageBarType={MessageBarType.info}>No Documents available</MessageBar>
    }
    return <div style={{ padding: 8 }}>{content}</div>
  }
}

export { IListingLinksProps, ListingLinks }
