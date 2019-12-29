import { IImage as UIFabricImage, Image } from "@uifabric/components"
import { getId } from "@uifabric/styleguide"
import { observer } from "mobx-react"
import * as React from "react"
import { FileField } from "./FileField"

interface IImage extends UIFabricImage {
  id?: number
  url?: string
  security_marking?: string
  image_type?: string
  [key: string]: any
}

export interface IImageFieldProps {
  image?: IImage
  label?: string
  onChange?: (image: IImage) => void
  onRenderImageFile?: (file: File, props: IImageFieldProps) => React.ReactNode
  onRenderSelect?: (props: IImageFieldProps) => React.ReactNode
  defaultSelectText?: string
  width?: number
  height?: number
  disabled?: boolean
}

export interface IImageFileProps {
  file: File
  alt?: string
  width?: number
  height?: number
}

export const ImageFile = observer((props: IImageFileProps) => {
  var _blobUrl: string
  var _setBlobUrl = (file: File) => {
    try {
      _blobUrl = URL.createObjectURL(file)
    } catch (e) {}
  }
  var _cleanupBlobUrl = () => {
    if (_blobUrl) {
      try {
        URL.revokeObjectURL(_blobUrl)
      } catch (e) {}
      _blobUrl = undefined
    }
  }
  React.useEffect(() => {
    _cleanupBlobUrl()
    _setBlobUrl(props.file)
    return _cleanupBlobUrl()
  })

  return <Image src={_blobUrl} width={props.width} height={props.height} alt={props.alt || props.file.name} />
})

const defaultRenderImageSelect = (props: IImageFieldProps) => {
  return <Image src={props.image.url} width={props.width} height={props.height} alt={props.label} />
}

const defaultRenderImageFile = (file: File, props: IImageFieldProps) => {
  return <ImageFile file={file} width={props.width} height={props.height} alt={props.label} />
}

export const ImageField = observer((props: IImageFieldProps) => {
  var _ref: HTMLInputElement
  var _id = React.useRef(getId("image-field"))

  var _onRenderFile = (file: File) => {
    return (props.onRenderImageFile || defaultRenderImageFile)(file, props)
  }
  var _onRenderFiles = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0]
      return _onRenderFile(file)
    }
    return null
  }
  var _onChange = (files: File[]) => {
    if (props.onChange) {
      props.onChange(files && files.length > 0 ? { file: files[0] } : undefined)
    }
  }
  var _onRenderSelectImage = () => {
    return (props.onRenderSelect || defaultRenderImageSelect)(props)
  }
  var _onClear = () => {
    if (props.onChange) {
      props.onChange(undefined)
    }
  }

  return (
    <FileField
      files={props.image && props.image.file ? [props.image.file] : undefined}
      label={props.label}
      multiple={false}
      accept="image/*"
      defaultSelectText={props.defaultSelectText || "Select an Image..."}
      onRenderSelect={props.image && props.image.url ? _onRenderSelectImage : undefined}
      onRenderFiles={_onRenderFiles}
      onChange={_onChange}
      onClear={props.image ? _onClear : undefined}
      disabled={props.disabled}
    />
  )
})
