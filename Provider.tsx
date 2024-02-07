import {
  Children,
  ComponentProps,
  ContextType,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from 'react'
import { ScrollView as Scroll, View, Animated } from 'react-native'
import StickyHeader from 'react-native/Libraries/Components/ScrollView/ScrollViewStickyHeader'

export function StickyItem({
  children,
  side = 'top',
  index = 0,
}: {
  children: React.ReactElement
  side?: 'top' | 'bottom'
  index?: number
}) {
  const {
    register,
    unregister,
    onLayout,
    scrollPosition,
    scrollViewLayout,
    ...context
  } = useContext(Context)
  const child = Children.only(children)
  const id = useId()
  const key = child.key || id
  useEffect(
    function mount() {
      return () => {
        if (key) unregister(key, side)
      }
    },
    [key, side],
  )
  const layouts = context[side].layouts
  const nextLayout =
    index > -1 ? layouts.get(context[side].ids[index + 1]) : null
  return (
    <StickyHeader
      ref={useCallback(
        (ref: ViewRef) => {
          if (key && ref) register(key, side, ref, index)
        },
        [key, side, index],
      )}
      hiddenOnScroll={false}
      nextHeaderLayoutY={nextLayout}
      onLayout={(event: any) => {
        onLayout(key, side, event.nativeEvent.layout.y, index)
      }}
      scrollAnimatedValue={scrollPosition}
      scrollViewHeight={scrollViewLayout?.height ?? null}
    >
      {children}
    </StickyHeader>
  )
}

type ViewRef = View & {
  setNextHeaderY: (y: number) => void
}

const Context = createContext(
  null as any as {
    top: {
      ids: Array<string>
      layouts: Map<string, number>
      refs: Map<string, ViewRef>
    }
    bottom: {
      ids: Array<string>
      layouts: Map<string, number>
      refs: Map<string, ViewRef>
    }
    register: (
      id: string,
      position: 'top' | 'bottom',
      ref: ViewRef,
      i: number,
    ) => void
    unregister: (id: string, position: 'top' | 'bottom') => void
    onLayout: (
      id: string,
      position: 'top' | 'bottom',
      layout: number,
      i: number,
    ) => void
    scrollPosition: Animated.Value
    scrollViewLayout: { width: number; height: number } | null
    setScrollViewLayout: (layout: { width: number; height: number }) => void
    hasStickyHeaders: boolean
  },
)
export function Provider({ children }: { children: React.ReactNode }) {
  const [scrollViewLayout, setScrollViewLayout] = useState<{
    width: number
    height: number
  } | null>(null)
  const state = useRef<Pick<ContextType<typeof Context>, 'top' | 'bottom'>>({
    bottom: {
      ids: [],
      layouts: new Map(),
      refs: new Map(),
    },
    top: {
      ids: [],
      layouts: new Map(),
      refs: new Map(),
    },
  })
  const scrollPosition = useRef(new Animated.Value(0)).current
  const [hasStickyHeaders, setHasStickyHeaders] = useState(false)
  const [, render] = useReducer(() => ({}), {})
  return (
    <Context.Provider
      value={{
        ...state.current,
        register(id, position, ref, index) {
          state.current[position].ids[index] = id
          state.current[position].refs.set(id, ref)
          if (!hasStickyHeaders) setHasStickyHeaders(true)
        },
        unregister(id, position) {
          const item = state.current[position]
          item.ids = state.current[position].ids.filter((i) => i !== id)
        },
        onLayout(id, position, layout, index) {
          state.current[position].layouts.set(id, layout)

          const nextId = state.current[position].ids[index - 1]

          console.log('[onLayout]', id, state.current[position].ids)

          if (nextId) {
            const nextRef = state.current[position].refs.get(nextId)
            if (nextRef) {
              console.log('next-ref', nextRef, 'layout', layout)
              nextRef.setNextHeaderY(layout)
            }
          }
          render()
        },
        scrollPosition,
        scrollViewLayout,
        setScrollViewLayout,
        hasStickyHeaders,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export const ScrollView = (props: ComponentProps<typeof Scroll>) => {
  const { top, scrollPosition, setScrollViewLayout, hasStickyHeaders } =
    useContext(Context)
  return (
    <Animated.ScrollView
      {...props}
      onContentSizeChange={(width, height) => {
        props.onContentSizeChange?.(width, height)
        setScrollViewLayout({ width, height })
      }}
      onScroll={Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                y: scrollPosition,
              },
            },
          },
        ],
        {
          useNativeDriver: false,
        },
      )}
      scrollEventThrottle={1}
    />
  )
}
