# 0.6.7 (19-07-2025)
## Improvement
- Restore scroll position when going back to home page [#17](https://github.com/tboye/offbeat.amsterdam/pull/17)

# 0.6.6 (17-07-2025)
## Fix
- Fix hydration issue breaking info/ticket panel [#16](https://github.com/tboye/offbeat.amsterdam/pull/16)

# 0.6.5 (14-07-2025)
## Fix
- Fix structured event data is inconsistent between event page and event cards [#15](https://github.com/tboye/offbeat.amsterdam/pull/15)

# 0.6.4 (13-07-2025)
## Fix
- Fix non-JSON-LD event entry is still present

# 0.6.3 (13-07-2025)
## Improvements
- Use JSON-LD for structured event data, increase field coverage [#14](https://github.com/tboye/offbeat.amsterdam/pull/14)
- Bump number of tags displayed on the home page to 10 [#14](https://github.com/tboye/offbeat.amsterdam/pull/14)

# 0.6.2 (16-06-2025)
## Changes
- Use 'agenda' in place page title

# 0.6.1 (10-06-2025)
## New Features
- Include external footer links into sitemap [#13](https://github.com/tboye/offbeat.amsterdam/pull/13)

# 0.6.0 (06-06-2025)
## Changes
- Removed footer, rearranged navbar, squeezed title on mobile [#11](https://github.com/tboye/offbeat.amsterdam/pull/11)
- `events` API method doesn't require admin rights anymore [#12](https://github.com/tboye/offbeat.amsterdam/pull/12)
- Places are included in the sitemap [#12](https://github.com/tboye/offbeat.amsterdam/pull/12)

## Fix
- Fix sitemap not generating due to stale status, set sitemap cache time to 10 minutes

# 0.5.0 (05-06-2025)
## Improvements
- Align look of custom pages and About page [#9](https://github.com/tboye/offbeat.amsterdam/pull/9)
- Adjust page titles [#10](https://github.com/tboye/offbeat.amsterdam/pull/10)

# 0.4.0 (25-05-2025)
## Fix
- Fix word break style in title

## Changes
- Align with Gancio `1.26.1`
[1.25.1](https://framagit.org/les/gancio/compare/v1.25.0...v1.25.1)
[1.26.0](https://framagit.org/les/gancio/compare/v1.25.1...v1.26.0)
[1.26.1](https://framagit.org/les/gancio/compare/v1.26.0...v1.26.1)

# 0.3.2 (23-04-2025)
## Fix
- Style title via CSS rather than text to prevent SEO issues

# 0.3.1 (22-03-2025)
## Changes
- Show link to source in footer as `vX.X.X`

# 0.3.0 (22-03-2025)
- Align with Gancio `1.25.0`
[1.24.4](https://framagit.org/les/gancio/compare/v1.24.3...v1.24.4)
[1.25.0](https://framagit.org/les/gancio/compare/v1.24.4...v1.25.0)

# 0.2.0 (10-03-2025)
- Align with Gancio `1.24.3`
[1.24.0](https://framagit.org/les/gancio/compare/v1.23.1...v1.24.0)
[1.24.1](https://framagit.org/les/gancio/compare/v1.24.0...v1.24.1)
[1.24.2](https://framagit.org/les/gancio/compare/v1.24.1...v1.24.2)
[1.24.3](https://framagit.org/les/gancio/compare/v1.24.2...v1.24.3)

# 0.1.2 (14-02-2025)
## Fixes
- Fix sitemap: show all events (with weekly freq) and last mod date, root page as daily + exclude unwanted routes
[#8](https://github.com/tboye/offbeat.amsterdam/pull/8)

# 0.1.1 (10-02-2025)
## Improvements
- Improve text display on About page (larger text size and better alignment)
- Set Monday as first day of the week in the calendar
- Beautify header gradients

# 0.1.0 (08-02-2025)
## Initial version
- Based off [Gancio 1.23.1](https://framagit.org/les/gancio/compare/v1.23.0...v1.23.1) 

## Fixes
- Fix `dialectOptions` are not respected [#4](https://github.com/tboye/offbeat.amsterdam/pull/4)

## Changes
- API rate limits won't be applied to admins [#5](https://github.com/tboye/offbeat.amsterdam/pull/5)
- Refine core visual elements [#6](https://github.com/tboye/offbeat.amsterdam/pull/6)

## Internal
- Add minimalistic pipeline to build and publish on GitHub release [#7](https://github.com/tboye/offbeat.amsterdam/pull/7)
