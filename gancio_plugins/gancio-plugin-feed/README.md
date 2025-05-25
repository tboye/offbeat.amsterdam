# ICS feed importer plugin for Gancio

This is a plugin for gancio that get events from a specified ics feed, this is a beta release: you can specify only a single feed, images are not imported from ics, event location are taken as is as are not structured in ics.

#### TODO
- [ ] parse GEO => latitude/longiture field?
- [ ] parse CATEGORY => tags field?
- [ ] add a default custom tag to imported events
- [ ] support for image (ics could not embed images, ok you can use ATTACH but it is not supported by the used library, see https://github.com/adamgibbons/ics/issues/194, we could visit the original event's url and get the image from there via opengraph with some fallback)
- [ ] improve location handling (query nominatim?)
- [ ] implement a createEvent helper for plugins?
- [ ] implement a `multiple` settings support in plugin system to include multiple feeds

## Configuration

Once the plugin is installed, navigate to your instance plugins tab of the admin interface. Enable the plugin and add the required data.


## Try it

1. Restart your gancio instance and look at the logs for any message saying that this plugin has been loaded.


ref:

- #493
- #546