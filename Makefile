#!/usr/bin/make -f
# make && sudo make install
#
# dipendenze: il make ha bisogno di npm
# il make install ha bisogno di apache2 e di systemd

prefix=/usr/local
exec_prefix=$(prefix)
bindir=$(exec_prefix)/bin
wwwdir=/var/www/questionari
launchservices=true
systemd_services=/lib/systemd/system
systemd_links=/etc/systemd/system

all:
	cd questionari && npm run-script build

clean:
	cd questionari && rm -rf dist

mkdirs:
	mkdir -p $(DESTDIR)$(prefix)
	mkdir -p $(DESTDIR)$(bindir)
	mkdir -p $(DESTDIR)$(wwwdir)
	mkdir -p $(DESTDIR)$(systemd_services)
	mkdir -p $(DESTDIR)$(systemd_links)

install: mkdirs
	cp websockets/websockets-server.py $(DESTDIR)$(bindir)/websockets-server
	cp websockets/websockets-server.service $(DESTDIR)$(systemd_services)
	cd $(DESTDIR)$(systemd_links) && ln -s $(DESTDIR)$(systemd_services)/websockets-server.service
	cp -r ws $(DESTDIR)$(wwwdir)
	cp -r questionari/dist/* $(DESTDIR)$(wwwdir)
	# Now, activate services... usually this is not done here
	# Assuming systemd
	test "$(launchservices)" = "true" && systemctl enable --now websockets-server
	# what about config?
	echo "You have to configure $(DESTDIR)$(wwwdir)/ws/include/config.php and $(DESTDIR)$(wwwdir)/webpack.config.js"