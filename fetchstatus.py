from pyrsi import RSIAPI
def get_status():
    rsi_api = RSIAPI()
    status = rsi_api.get_status()
    return status
if __name__ == "__main__":
    print(get_status())