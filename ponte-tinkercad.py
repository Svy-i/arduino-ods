import json
import os

print("🌱 Ponte Tinkercad -> Dashboard Iniciada!")
print("Instruções: Altere os valores no Tinkercad, copie a linha JSON gerada e cole aqui.")

while True:
    try:
        # Aguarda você colar a linha do Monitor Serial e pressionar Enter
        linha_serial = input("\nCole o JSON do Tinkercad: ").strip()
        
        if not linha_serial:
            continue
            
        # Converte a string colada em dicionário Python
        dados_arduino = json.loads(linha_serial)
        
        # Mapeamento do LDR para porcentagem (O Tinkercad envia de 0 a 1023)
        # Convertemos para 0-100% para fazer sentido visual nos cards
        porcentagem_luz = int((dados_arduino["luz"] / 1023.0) * 100)
        
        # Monta a estrutura exatamente igual ao que o render(reading) do seu JS espera
        payload = {
            "luminosidade": porcentagem_luz,
            "temperatura": round(float(dados_arduino["temperatura"]), 1),
            "umidade": int(dados_arduino["umidade"]),
            "rega_ativa": True if dados_arduino["bomba"] == 1 else False
        }
        
        # Salva em um arquivo JSON local na mesma pasta do site
        with open("dados_tinkercad.json", "w") as f:
            json.dump(payload, f)
            
        print("✅ Arquivo 'dados_tinkercad.json' atualizado!")
        print(f"Dados salvos: Luz: {payload['luminosidade']}% | Temp: {payload['temperatura']}°C | Umidade: {payload['umidade']}% | Rega: {payload['rega_ativa']}")
        
    except json.JSONDecodeError:
        print("❌ Erro: O texto colado não é um JSON válido. Verifique se copiou a linha inteira.")
    except Exception as e:
        print(f"❌ Erro ao salvar dados: {e}")