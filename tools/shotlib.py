"""
매뉴얼 화면 캡처 도우미 — E2E 시연 환경(한 PC)에 로그인해 1600x1000 으로 찍는다.

    PY = pmsx-collector 의 .venv python (Playwright 설치됨)
    from shotlib import open_app, shot
    with open_app("platform", "admin") as pg:      # 로그인된 페이지
        pg.goto(URL["platform"] + "/agents"); pg.wait_for_timeout(2500)
        shot(pg, "platform/agents-run.png")       # → img/platform/agents-run.png

한 번에 브라우저 하나만 띄우고, 다 찍으면 with 블록을 빠져나가 닫는다(메모리가 작다).
시연 데이터를 지우거나 저장하지 않는다 — 창은 취소·Esc 로 닫는다.
"""
import os
from contextlib import contextmanager
from playwright.sync_api import sync_playwright

URL = {"platform": "http://127.0.0.1:8710", "pmsx": "http://127.0.0.1:8080", "datalake": "http://127.0.0.1:8790"}
USERS = {
    "platform": {"admin": ("admin", "Admin!2026"), "dev": ("dev1", "Dev1!2026")},
    "pmsx": {"admin": ("admin", "pmsx1234!"), "op": ("op.seo", "pmsx1234!"), "customer": ("customer", "pmsx1234!")},
    "datalake": {"admin": ("admin", "Lake!2026"), "ana": ("ana01", "Lake!2026"), "eng": ("eng", "Lake!2026")},
}
IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "img")


@contextmanager
def open_app(app, who, width=1600, height=1000, scale=1):
    login_id, pw = USERS[app][who]
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True)
        try:
            pg = b.new_page(viewport={"width": width, "height": height}, device_scale_factor=scale)
            pg.set_default_timeout(60000)
            pg.goto(URL[app] + "/login", wait_until="domcontentloaded", timeout=180000)
            pg.wait_for_timeout(1500)
            ok = pg.evaluate(
                "(c) => fetch('/api/v1/auth/login', {method:'POST', credentials:'same-origin', headers:{'content-type':'application/json'}, body: JSON.stringify({loginId:c[0], password:c[1]})}).then(r => r.ok)",
                [login_id, pw],
            )
            if not ok:
                raise RuntimeError(f"{app} {who} 로그인 실패")
            pg.goto(URL[app] + "/", wait_until="domcontentloaded")
            pg.wait_for_timeout(2500)
            yield pg
        finally:
            b.close()


def shot(pg, rel, full=False, clip=None):
    """img/<rel> 로 저장. clip={'x','y','width','height'} 로 부분만."""
    path = os.path.join(IMG, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pg.screenshot(path=path, full_page=full, clip=clip)
    return path
