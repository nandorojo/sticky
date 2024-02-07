import { Text, View } from 'react-native'
import { Provider, ScrollView, StickyItem } from './Provider'

export default function App() {
  return (
    <Provider>
      <ScrollView>
        <View style={{ height: 500, backgroundColor: 'blue' }}></View>
        <StickyItem index={0}>
          <Text style={{ backgroundColor: 'white', padding: 50 }}>
            This is a sticky header
          </Text>
        </StickyItem>
        <View style={{ height: 500, backgroundColor: 'green' }}></View>
        <StickyItem index={1}>
          <View>
            <Text
              style={{ color: 'white', backgroundColor: 'black', padding: 50 }}
            >
              This is a sticky header 2
            </Text>
          </View>
        </StickyItem>
        <View style={{ height: 3000, backgroundColor: 'blue' }}></View>
      </ScrollView>
    </Provider>
  )
}
