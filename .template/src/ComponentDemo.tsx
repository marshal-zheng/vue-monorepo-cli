import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import VueTypes from 'vue-types'

@Component
export class ComponentDemo extends Vue {
  @Prop(VueTypes.string) customProp!: string

  render () {
    return (<div>ComponentDemo内容</div>)
  }
}
