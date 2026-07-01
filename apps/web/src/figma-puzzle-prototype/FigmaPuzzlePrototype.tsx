import './FigmaPuzzlePrototype.css'
import type { ReactNode } from 'react'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const SLICE_LEFT = 36
const SLICE_RIGHT = 36
const SLICE_TOP = 24
const SLICE_BOTTOM = 24

type NineSliceVariant = 'box001' | 'box002'

interface NineSliceBoxProps {
  readonly height: number
  readonly nodeId: string
  readonly variant: NineSliceVariant
  readonly width: number
  readonly x: number
  readonly y: number
}

interface ImageLayerProps {
  readonly className?: string
  readonly height: number
  readonly name?: string
  readonly nodeId?: string
  readonly preserveAspectRatio?: string
  readonly src: string
  readonly width: number
  readonly x: number
  readonly y: number
}

interface TextLayerProps {
  readonly children: ReactNode
  readonly className?: string
  readonly height: number
  readonly nodeId?: string
  readonly width: number
  readonly x: number
  readonly y: number
}

const assetBase = `${import.meta.env.BASE_URL}figma-puzzle-prototype/`

const nineSliceAssets = {
  box001: {
    bottomLeft: `${assetBase}box-001-bottom-left.png`,
    bottomRight: `${assetBase}box-001-bottom-right.png`,
    bottomStretch: `${assetBase}box-001-bottom-stretch.png`,
    middleLeft: `${assetBase}box-001-middle-left.png`,
    middleRight: `${assetBase}box-001-middle-right.png`,
    middleStretch: `${assetBase}box-001-middle-stretch.png`,
    topLeft: `${assetBase}box-001-top-left.png`,
    topRight: `${assetBase}box-001-top-right.png`,
    topStretch: `${assetBase}box-001-top-stretch.png`,
  },
  box002: {
    bottomLeft: `${assetBase}box-002-bottom-left.png`,
    bottomRight: `${assetBase}box-002-bottom-right.png`,
    bottomStretch: `${assetBase}box-002-bottom-stretch.png`,
    middleLeft: `${assetBase}box-002-middle-left.png`,
    middleRight: `${assetBase}box-002-middle-right.png`,
    middleStretch: `${assetBase}box-002-middle-stretch.png`,
    topLeft: `${assetBase}box-002-top-left.png`,
    topRight: `${assetBase}box-002-top-right.png`,
    topStretch: `${assetBase}box-002-top-stretch.png`,
  },
} satisfies Record<NineSliceVariant, Record<string, string>>

const panels: readonly NineSliceBoxProps[] = [
  { nodeId: '32:12', variant: 'box001', x: 476, y: 22, width: 1134, height: 84 },
  { nodeId: '32:52', variant: 'box001', x: 1635, y: 22, width: 128, height: 84 },
  { nodeId: '32:62', variant: 'box001', x: 1767, y: 22, width: 128, height: 84 },
  { nodeId: '32:42', variant: 'box001', x: 1635, y: 114, width: 260, height: 332 },
  { nodeId: '32:72', variant: 'box001', x: 1635, y: 463, width: 260, height: 315 },
  { nodeId: '32:32', variant: 'box001', x: 476, y: 114, width: 1134, height: 664 },
  { nodeId: '33:114', variant: 'box001', x: 360, y: 789, width: 1081, height: 276 },
  { nodeId: '33:93', variant: 'box002', x: 1636, y: 786, width: 259, height: 171 },
]

function NineSliceBox({ height, nodeId, variant, width, x, y }: NineSliceBoxProps) {
  const assets = nineSliceAssets[variant]
  const centerWidth = Math.max(1, width - SLICE_LEFT - SLICE_RIGHT)
  const centerHeight = Math.max(1, height - SLICE_TOP - SLICE_BOTTOM)
  const rightX = width - SLICE_RIGHT
  const bottomY = height - SLICE_BOTTOM

  return (
    <svg
      className="figma-puzzle-nine-slice"
      data-node-id={nodeId}
      data-variant={variant}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      x={x}
      y={y}
    >
      <image height={SLICE_TOP} href={assets.topLeft} preserveAspectRatio="none" width={SLICE_LEFT} x="0" y="0" />
      <image
        height={SLICE_TOP}
        href={assets.topStretch}
        preserveAspectRatio="none"
        width={centerWidth}
        x={SLICE_LEFT}
        y="0"
      />
      <image
        height={SLICE_TOP}
        href={assets.topRight}
        preserveAspectRatio="none"
        width={SLICE_RIGHT}
        x={rightX}
        y="0"
      />
      <image
        height={centerHeight}
        href={assets.middleLeft}
        preserveAspectRatio="none"
        width={SLICE_LEFT}
        x="0"
        y={SLICE_TOP}
      />
      <image
        height={centerHeight}
        href={assets.middleStretch}
        preserveAspectRatio="none"
        width={centerWidth}
        x={SLICE_LEFT}
        y={SLICE_TOP}
      />
      <image
        height={centerHeight}
        href={assets.middleRight}
        preserveAspectRatio="none"
        width={SLICE_RIGHT}
        x={rightX}
        y={SLICE_TOP}
      />
      <image
        height={SLICE_BOTTOM}
        href={assets.bottomLeft}
        preserveAspectRatio="none"
        width={SLICE_LEFT}
        x="0"
        y={bottomY}
      />
      <image
        height={SLICE_BOTTOM}
        href={assets.bottomStretch}
        preserveAspectRatio="none"
        width={centerWidth}
        x={SLICE_LEFT}
        y={bottomY}
      />
      <image
        height={SLICE_BOTTOM}
        href={assets.bottomRight}
        preserveAspectRatio="none"
        width={SLICE_RIGHT}
        x={rightX}
        y={bottomY}
      />
    </svg>
  )
}

function ImageLayer({
  className,
  height,
  name,
  nodeId,
  preserveAspectRatio = 'none',
  src,
  width,
  x,
  y,
}: ImageLayerProps) {
  return (
    <image
      className={className}
      data-name={name}
      data-node-id={nodeId}
      height={height}
      href={src}
      preserveAspectRatio={preserveAspectRatio}
      width={width}
      x={x}
      y={y}
    />
  )
}

function TextLayer({ children, className = '', height, nodeId, width, x, y }: TextLayerProps) {
  return (
    <foreignObject data-node-id={nodeId} height={height} width={width} x={x} y={y}>
      <div className={`figma-text ${className}`}>{children}</div>
    </foreignObject>
  )
}

function Divider({
  height = 2,
  nodeId,
  rotate,
  src,
  width,
  x,
  y,
}: {
  readonly height?: number
  readonly nodeId: string
  readonly rotate?: boolean
  readonly src: string
  readonly width: number
  readonly x: number
  readonly y: number
}) {
  if (rotate) {
    return (
      <g data-node-id={nodeId} transform={`translate(${x} ${y}) rotate(90)`}>
        <image height={height} href={src} preserveAspectRatio="none" width={width} x="0" y="-1" />
      </g>
    )
  }

  return <image data-node-id={nodeId} height={height} href={src} preserveAspectRatio="none" width={width} x={x} y={y - 1} />
}

export default function FigmaPuzzlePrototype() {
  return (
    <main className="figma-puzzle-prototype" aria-label="Figma puzzle UI prototype">
      <svg
        className="figma-puzzle-canvas"
        data-node-id="28:5"
        role="img"
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
      >
        <rect fill="#f6eee2" height={DESIGN_HEIGHT} width={DESIGN_WIDTH} x="0" y="0" />

        {panels.map((panel) => (
          <NineSliceBox key={panel.nodeId} {...panel} />
        ))}

        <ImageLayer
          height={573}
          name="rules-panel"
          nodeId="46:306"
          src={`${assetBase}rule-panel-vector.png`}
          width={423}
          x={32}
          y={114}
        />

        <ImageLayer
          className="figma-puzzle-portrait"
          height={560}
          name="assistant"
          nodeId="33:113"
          preserveAspectRatio="xMidYMid slice"
          src={`${assetBase}assistant-portrait.png`}
          width={420}
          x={1284}
          y={711}
        />
        <ImageLayer
          className="figma-puzzle-portrait"
          height={548}
          name="protagonist"
          nodeId="33:111"
          preserveAspectRatio="xMidYMid slice"
          src={`${assetBase}protagonist-portrait.png`}
          width={411}
          x={32}
          y={636}
        />

        <TextLayer className="text-title text-heavy" height={55} nodeId="38:85" width={197} x={105} y={36}>
          未登记现场
        </TextLayer>

        <TextLayer className="text-button-stacked" height={64} nodeId="46:318" width={49} x={1677} y={32}>
          <p>重置</p>
          <p>调查</p>
        </TextLayer>
        <TextLayer className="text-button" height={32} nodeId="46:320" width={49} x={1806} y={48}>
          设置
        </TextLayer>

        <TextLayer className="text-button-stacked" height={64} nodeId="46:283" width={49} x={506} y={32}>
          <p>案件</p>
          <p>档案</p>
        </TextLayer>
        <TextLayer className="text-case-number" height={72} nodeId="46:284" width={68} x={574} y={24}>
          04
        </TextLayer>
        <Divider nodeId="46:285" rotate src={`${assetBase}divider-short.svg`} width={52} x={656} y={38} />
        <TextLayer className="text-case-name" height={32} nodeId="46:286" width={156} x={675} y={46}>
          红松汽车旅馆
        </TextLayer>
        <TextLayer className="text-stat-label" height={26} nodeId="46:287" width={106} x={1254} y={35}>
          已标记异常
        </TextLayer>
        <TextLayer className="text-stat-value" height={32} nodeId="46:289" width={63} x={1276} y={64}>
          2 / 3
        </TextLayer>
        <Divider nodeId="46:292" rotate src={`${assetBase}divider-short.svg`} width={52} x={1403} y={38} />
        <TextLayer className="text-stat-label" height={26} nodeId="46:288" width={62} x={1464} y={35}>
          已检查
        </TextLayer>
        <TextLayer className="text-stat-value" height={32} nodeId="46:291" width={97} x={1446} y={64}>
          17 / 24
        </TextLayer>

        <TextLayer className="text-heading" height={35} nodeId="45:136" width={96} x={57} y={138}>
          现场定则
        </TextLayer>
        <Divider nodeId="46:293" src={`${assetBase}divider-wide.svg`} width={369} x={57} y={182} />
        <TextLayer className="text-rule-index" height={29} nodeId="46:295" width={23} x={57} y={213}>
          01
        </TextLayer>
        <TextLayer className="text-rule-copy" height={29} nodeId="46:300" width={232} x={93} y={213}>
          房间里恰好有1个垃圾桶。
        </TextLayer>
        <ImageLayer height={27} nodeId="46:313" src={`${assetBase}rule-exact-icon-alt.svg`} width={26.5} x={383} y={215} />
        <TextLayer className="text-rule-index" height={29} nodeId="46:296" width={23} x={57} y={285}>
          02
        </TextLayer>
        <TextLayer className="text-rule-copy" height={29} nodeId="46:301" width={252} x={93} y={285}>
          房间里恰好有2处异常区域。
        </TextLayer>
        <ImageLayer height={27} nodeId="46:310" src={`${assetBase}rule-exact-icon.svg`} width={26.5} x={383} y={287} />
        <TextLayer className="text-rule-index" height={29} nodeId="46:297" width={23} x={57} y={357}>
          03
        </TextLayer>
        <TextLayer className="text-rule-copy" height={58} nodeId="46:302" width={220} x={93} y={357}>
          <p>每个酒瓶的上下左右临格</p>
          <p>里，必有1个垃圾桶。</p>
        </TextLayer>
        <ImageLayer height={40} nodeId="46:314" src={`${assetBase}rule-orthogonal-icon.svg`} width={40} x={376} y={366} />
        <TextLayer className="text-rule-index" height={29} nodeId="46:298" width={23} x={57} y={460}>
          04
        </TextLayer>
        <TextLayer className="text-rule-copy" height={58} nodeId="46:303" width={192} x={93} y={460}>
          <p>每面镜子的周围一圈</p>
          <p>里，必有1处异常区域</p>
        </TextLayer>
        <ImageLayer height={40} nodeId="46:315" src={`${assetBase}rule-adjacent-icon.svg`} width={40} x={376} y={466} />

        <TextLayer className="text-heading" height={35} nodeId="45:137" width={120} x={495} y={138}>
          现场平面图
        </TextLayer>
        <TextLayer className="text-heading" height={35} nodeId="45:135" width={144} x={1654} y={138}>
          现场登记记录
        </TextLayer>
        <Divider nodeId="46:273" src={`${assetBase}divider-side.svg`} width={214} x={1654} y={182} />
        <TextLayer className="text-heading" height={35} nodeId="45:134" width={96} x={1654} y={487}>
          我的标记
        </TextLayer>
        <Divider nodeId="46:274" src={`${assetBase}divider-side.svg`} width={214} x={1654} y={534} />

        <TextLayer className="text-vn-speaker" height={41} nodeId="45:85" width={84} x={395} y={813}>
          丹尼尔
        </TextLayer>
        <TextLayer className="text-vn-copy" height={79} nodeId="45:86" width={360} x={395} y={869}>
          <p className="vn-line">第二条规则刚刚锁定了一个结论。</p>
          <p>
            <span className="text-danger">C3</span> 不可能再是异常了。
          </p>
        </TextLayer>
        <TextLayer className="text-submit-title" height={46} nodeId="45:87" width={128} x={1702} y={813}>
          提交调查
        </TextLayer>
        <TextLayer className="text-submit-note" height={58} nodeId="45:88" width={120} x={1706} y={869}>
          <p>提交当前调查</p>
          <p>以及全部标记</p>
        </TextLayer>
      </svg>
    </main>
  )
}
