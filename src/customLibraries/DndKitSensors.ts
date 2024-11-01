import {
  MouseSensor as DndKitMouseSensor,
  TouchSensor as DndKitTouchSensor,
  MouseSensorOptions,
  TouchSensorOptions
} from '@dnd-kit/core'

// Block DnD event propagation if element has "data-no-dnd" attribute
const mouseHandler = (
  { nativeEvent }: { nativeEvent: MouseEvent },
  { onActivation }: MouseSensorOptions
) => {
  let cur = nativeEvent.target as HTMLElement | null
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement
  }
  return true
}

const touchHandler = (
  { nativeEvent }: { nativeEvent: TouchEvent },
  { onActivation }: TouchSensorOptions
) => {
  let cur = nativeEvent.target as HTMLElement | null
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement
  }
  return true
}

export class MouseSensor extends DndKitMouseSensor {
  static activators = [
    { eventName: 'onMouseDown' as const, handler: mouseHandler }
  ]
}

export class TouchSensor extends DndKitTouchSensor {
  static activators = [
    { eventName: 'onTouchStart' as const, handler: touchHandler }
  ]
}
