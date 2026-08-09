import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'

import Content from './context-menu-content.svelte'
import Group from './context-menu-group.svelte'
import Item from './context-menu-item.svelte'
import Label from './context-menu-label.svelte'
import Separator from './context-menu-separator.svelte'
import Shortcut from './context-menu-shortcut.svelte'
import Trigger from './context-menu-trigger.svelte'

const Sub = ContextMenuPrimitive.Sub
const Root = ContextMenuPrimitive.Root

export {
  Content,
  //
  Root as ContextMenu,
  Content as ContextMenuContent,
  Group as ContextMenuGroup,
  Item as ContextMenuItem,
  Label as ContextMenuLabel,
  Separator as ContextMenuSeparator,
  Shortcut as ContextMenuShortcut,
  Sub as ContextMenuSub,
  Trigger as ContextMenuTrigger,
  Group,
  Item,
  Label,
  Root,
  Separator,
  Shortcut,
  Sub,
  Trigger,
}
