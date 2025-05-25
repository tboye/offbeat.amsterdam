# let's use a good old Makefile for some small utilities

## generate AUTHORS.md
authors:
	git shortlog -sne | cut -f 2 > AUTHORS.md
