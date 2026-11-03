import os,re
d=os.path.dirname(os.path.abspath(__file__));r=lambda f:open(os.path.join(d,f)).read()
h=r('shell.html').replace('<link rel="stylesheet" href="portal-app/portal.css">','<style>'+r('portal.css')+'</style>')
js='\n'.join(r(f) for f in('format.js','demo-data.js','app.js'))
h=re.sub(r'<script src="portal-app/format.js"></script>\s*<script src="portal-app/demo-data.js"></script>\s*<script src="portal-app/app.js"></script>',lambda m:'<script>\n'+js+'\n</script>',h)
open(os.path.join(d,'..','portal.html'),'w').write(h)
