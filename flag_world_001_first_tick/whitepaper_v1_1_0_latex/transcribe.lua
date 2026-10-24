-- Presentation-only wrapping of long evidence identifiers; no content replacement.
function Str(el)
  if el.text:match('_') or el.text:match('^%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x%x') then
    local before, core, after = el.text:match('^(.-)([%w_./%-]+)([^%w_./%-]*)$')
    if core then return {pandoc.Str(before), pandoc.RawInline('latex', '\\nolinkurl{' .. core .. '}'), pandoc.Str(after)} end
  end
end
function Image(el)
  if el.attributes.width and tonumber(el.attributes.width:match('[%d.]+')) > 6 then
    el.attributes.width = '6in'
    el.attributes.height = nil
  end
  return el
end
