---
type: slide
slideOptions:
  transition: slide
---
Tentativi di Tecnologie Conviviali
======

---

# Intro obbligato

---

- is technology neutral? (hint: nope)
- there are choices based on values...
- ...and consequences


note: la tecnologia non e' neutrale ma facilita dei casi d'uso, modifica l'ambito del possibile. gli strumenti sono formati dalla visione di chi li ha pensati, progettati e costruiti e ne propagano i valori. nello sviluppo di strumenti ci sono quindi scelte progettuali e ci sono delle conseguenze sulle scelte che vengono fatte, questa e' la teoria. in pratica parliamo di quali sono le impostazioni di default, quali sono le funzionalita' che scegliamo di implementare o meno, quali sono i casi d'uso che vogliamo agevolare o meno.

----

# Gancio

	 A shared agenda for local communities.

---

note: un po' di storia, mostro la pagina di gancio a marzo 2019.
sgombero asilo 8 febbraio: in corteo il giorno dopo, parlando con qualcuno venne fuori questa necessita' che era gia' nelle corde di qualcuno di noi.
c'era carta canta, un mensile cartaceo con gli appuntamenti della citta'.
scrissi gancio di getto in circa un mese con la consapevolezza gia' dall'inizio di voler scrivere uno strumento che potesse essere adottato da altre comunita'....

con questi ragionamenti in sottofondo quindi quali sono i valori

---

### small & Local

- size matters
- small tech does not scale and it's ok
- local (no timezone)

note:
progettando strumenti che devono scalare verso l'alto costruiamo fondamentalmente centri di potere. non e' solo una questione di software libero o della proprieta' del software... se fb fosse nostro sarebbe comunque un problema, se il parlamento fosse nostro sarebbe comunque un problema. gancio non e' pensato per scalare, anzi, il caso d'uso facilitato e' quello di un nodo legato ad un territorio e questa scelta ha poi conseguenze sulla progettazione del sw e nel suo utilizzo.

---

### focus on content

nowhere on gancio appears the identity of who published the event, not even under a nickname, not even to administrators (except in the db). This is not an ego-friendly platform.

---

### random people first

We do not want logged user to get more features than random visitor. People don't have to register to use it, not even to publish events.


---

### Fuck walled garden

We are not interested in making hits, monitor user activities, sell data or ads: we export events in many ways, via RSS feeds, via global or individual ics, incorporating lists of events or single event via iframe on other websites, via h-event (microformat) and via ActivityPub.

---

### ... 5 anni dopo

----

~ 80 istanze e 21 lingue

----

### Torino 
### https://gancio.cisti.org

----

### Milano
### https://puntello.org

----

### Bologna
### https://balotta.org

----

### Firenze
### https://lapunta.org

----

### Brescia, Bergamo, Verona?
### https://lasitua.org/

----

### Sardegna
### https://sapratza.in/

----

### Calabria
### https://camifa.net (cosenza)
### https://nanassa.com (stretto)

----

### Trento, Rovereto
### https://gancio.daghe.xyz/

----

### Ravenna e Ferrara
https://www.fuorinellanebbia.it/

----

### Bilbao
### https://www.bilbi.info/

----

### Barcellona
### https://bcn.convoca.la/

----

### Madrid
### https://mad.convoca.la/

----

### Monpellier
### https://www.aleale.org/

----

### Bonn
### https://flyinghigh-bonn.org/

----

### Bogota'
### https://autonoma.red

----

### Valencia
### https://calendari.cc/

----

### comunita'
- https://constellation.ingouvernables.info/
- https://fahrradtermine.berlin/
- https://akce.cyberladies.cz/
- https://tricity.dance/
- https://eventos.conhub.pt/
- https://meetup.events/
- https://kinkcalendar.site/
- https://puppycalendar.eu/
- https://ottawa.askapunk.net/

---

> ### Walled Garden
> A closed platform, walled garden, or closed ecosystem is a software system wherein service provider has control over applications, content, and/or media, and restricts convenient access to non-approved applicants

---

![](https://doc.cisti.org/uploads/a89a8b6d-0993-4667-9a51-70cfa655156e.png)


---

![](https://doc.cisti.org/uploads/71b714ec-ff4c-45e1-b9d1-8ea71638a7a2.png)

---

### RSS / Feed

- demo su thunderbird e come funziona
- feeder

----

file:///home/les/signal-2024-05-24-222653.png![](https://doc.cisti.org/uploads/dc9a30eb-4ae4-44a1-8bed-9126088d1de8.png)

----

### ICS
- demo su thunderbird


--

## Web

<gancio-events baseurl="https://gancio.cisti.org" title="Prossimi due eventi da Torino" show_recurrent="true" sidebar="true" theme="dark" maxlength=2></gancio-events>

---

```js
<gancio-events baseurl="https://gancio.cisti.org"
  title="Prossimi due eventi da Torino" show_recurrent="true"
  sidebar="true" theme="dark" maxlength=2></gancio-events>
```


----


### API
- JSON 

---

### Changelog

----

- Geocoding
- Online events
- Editor role

---

# Moderation

---

# Collections

---

### AP
- in uscita (e.g. da mastodon)
- interazione, commenti, etc.
- in entrata (trusted nodes, bolle, etc..)

---

# Next
- eventi ricorrenti
- fusi orari



