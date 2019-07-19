# Journal

A minimal journaling application for CLI

OPTIONS:
hilite (color) (#tag || default)
  hilite tags, several colors are available
erase (date)
  select from a list an entry to erase
read (tasks || records || logs || #tag || date) (#tag || date) (date || #tag) (#tag)
  verbose command used to search through entries
edit (date)
  select from a list an entry to edit
task (date || task) (task)
  record a task
record (date)
  record a multiline log
log (date || log) (log)
  record a log
redact (#tag)
  hide a tag
unredact (#tag)
  unhide a tag
webview (port)
  initiates a webserver on specified port, default is 8080
print (file) (tasks || logs || records || date) (date) (date)
  builds a human readable text for a date range
export (file)
  spawns json
import (file)
  copies json
burn
  destroys unexported json
