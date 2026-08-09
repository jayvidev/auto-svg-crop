import { Select as SelectPrimitive } from 'bits-ui'

import Content from './select-content.svelte'
import Group from './select-group.svelte'
import Item from './select-item.svelte'
import Label from './select-label.svelte'
import Trigger from './select-trigger.svelte'

const Root = SelectPrimitive.Root

export {
  Content,
  Group,
  Item,
  Label,
  Root,
  //
  Root as Select,
  Content as SelectContent,
  Group as SelectGroup,
  Item as SelectItem,
  Label as SelectLabel,
  Trigger as SelectTrigger,
  Trigger,
}
