# ₿ JS Wallet Generator - Gerador de Carteiras Bitcoin

## 🎯 Objetivo de Aprendizado
Projeto desenvolvido para estudar **criptografia** e **blockchain**, implementando um gerador de carteiras Bitcoin Testnet usando padrões BIP32, BIP39 e bibliotecas criptográficas JavaScript.

## 🛠️ Tecnologias Utilizadas
- **Runtime:** Node.js
- **Criptografia:** bitcoinjs-lib
- **Padrões:** BIP32 (HD Wallets), BIP39 (Mnemonic)
- **Rede:** Bitcoin Testnet
- **Conceitos estudados:**
  - Criptografia de chave pública/privada
  - Hierarchical Deterministic (HD) Wallets
  - Mnemonic seed phrases
  - Bitcoin address generation
  - Elliptic Curve Cryptography
  - Hash functions (SHA256, RIPEMD160)

## 🚀 Demonstração
```javascript
const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');

// Configuração para Bitcoin Testnet
const network = bitcoin.networks.testnet;

class WalletGenerator {
  constructor() {
    this.network = network;
  }

  generateWallet() {
    // Gerar mnemonic de 12 palavras
    const mnemonic = bip39.generateMnemonic();
    
    // Converter mnemonic para seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Criar root key a partir do seed
    const root = bip32.fromSeed(seed, this.network);
    
    // Derivar chave usando caminho BIP44 para Bitcoin Testnet
    // m/44'/1'/0'/0/0 (1' = testnet)
    const path = "m/44'/1'/0'/0/0";
    const child = root.derivePath(path);
    
    // Gerar endereço Bitcoin
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: this.network
    });
    
    return {
      address,
      privateKey: child.toWIF(),
      publicKey: child.publicKey.toString('hex'),
      mnemonic,
      path,
      network: 'testnet'
    };
  }

  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }

  restoreFromMnemonic(mnemonic, addressIndex = 0) {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    const path = `m/44'/1'/0'/0/${addressIndex}`;
    const child = root.derivePath(path);

    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: this.network
    });

    return {
      address,
      privateKey: child.toWIF(),
      publicKey: child.publicKey.toString('hex'),
      path,
      index: addressIndex
    };
  }
}

// Uso da classe
const generator = new WalletGenerator();
const wallet = generator.generateWallet();

console.log('🔐 Nova Carteira Bitcoin Testnet Gerada:');
console.log('📍 Endereço:', wallet.address);
console.log('🔑 Chave Privada (WIF):', wallet.privateKey);
console.log('🔓 Chave Pública:', wallet.publicKey);
console.log('📝 Mnemonic:', wallet.mnemonic);
console.log('🛤️  Caminho de Derivação:', wallet.path);
```

## 💡 Principais Aprendizados

### 🔐 Criptografia Bitcoin
- **Elliptic Curve:** secp256k1 para geração de chaves
- **Hash Functions:** SHA256, RIPEMD160 para endereços
- **Base58Check:** Encoding para endereços legíveis
- **WIF:** Wallet Import Format para chaves privadas

### 🌱 HD Wallets (BIP32)
- **Hierarchical Deterministic:** Uma seed gera múltiplas chaves
- **Derivation Paths:** Estrutura padronizada m/44'/1'/0'/0/0
- **Extended Keys:** xpub/xprv para chaves estendidas
- **Child Key Derivation:** Geração determinística de chaves filhas

### 📝 Mnemonic Seeds (BIP39)
- **12/24 palavras:** Representação humana de entropy
- **Wordlist:** 2048 palavras padronizadas
- **Checksum:** Validação de integridade
- **Seed Generation:** Conversão para seed binário

## 🧠 Conceitos Técnicos Estudados

### 1. **Geração de Endereços Bitcoin**
```javascript
function generateBitcoinAddress(publicKey, network) {
  // 1. SHA256 da chave pública
  const sha256Hash = bitcoin.crypto.sha256(publicKey);
  
  // 2. RIPEMD160 do hash SHA256
  const ripemd160Hash = bitcoin.crypto.ripemd160(sha256Hash);
  
  // 3. Adicionar version byte (0x00 para mainnet, 0x6f para testnet)
  const versionByte = network === bitcoin.networks.testnet ? 0x6f : 0x00;
  const versionedHash = Buffer.concat([Buffer.from([versionByte]), ripemd160Hash]);
  
  // 4. Double SHA256 para checksum
  const checksum = bitcoin.crypto.sha256(bitcoin.crypto.sha256(versionedHash)).slice(0, 4);
  
  // 5. Concatenar e codificar em Base58
  const addressBytes = Buffer.concat([versionedHash, checksum]);
  const address = bitcoin.address.toBase58Check(addressBytes);
  
  return address;
}
```

### 2. **Derivação de Chaves HD**
```javascript
class HDWallet {
  constructor(seed, network) {
    this.root = bip32.fromSeed(seed, network);
    this.network = network;
  }

  // Derivar chave usando caminho BIP44
  deriveAccount(coinType = 1, account = 0) {
    // m/44'/coinType'/account'
    const accountPath = `m/44'/${coinType}'/${account}'`;
    return this.root.derivePath(accountPath);
  }

  // Derivar endereço específico
  deriveAddress(account, change = 0, addressIndex = 0) {
    // m/44'/1'/account'/change/addressIndex
    const fullPath = `m/44'/1'/${account}'/${change}/${addressIndex}`;
    const child = this.root.derivePath(fullPath);
    
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: this.network
    });

    return {
      address,
      privateKey: child.toWIF(),
      publicKey: child.publicKey.toString('hex'),
      path: fullPath,
      index: addressIndex
    };
  }

  // Gerar múltiplos endereços
  generateAddresses(count = 10, account = 0, change = 0) {
    const addresses = [];
    
    for (let i = 0; i < count; i++) {
      addresses.push(this.deriveAddress(account, change, i));
    }
    
    return addresses;
  }
}
```

### 3. **Validação e Recuperação**
```javascript
class WalletValidator {
  static validateAddress(address, network) {
    try {
      bitcoin.address.toOutputScript(address, network);
      return true;
    } catch (error) {
      return false;
    }
  }

  static validatePrivateKey(privateKey, network) {
    try {
      bitcoin.ECPair.fromWIF(privateKey, network);
      return true;
    } catch (error) {
      return false;
    }
  }

  static validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }

  static getAddressFromPrivateKey(privateKey, network) {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network
    });
    return address;
  }
}
```

## 📁 Estrutura do Projeto
```
js-wallet-generator/
├── src/
│   ├── generateWallet.js      # Script principal
│   ├── WalletGenerator.js     # Classe do gerador
│   ├── HDWallet.js           # Implementação HD Wallet
│   └── utils/
│       ├── crypto.js         # Utilitários criptográficos
│       └── validator.js      # Validações
├── examples/                 # Exemplos de uso
├── tests/                    # Testes unitários
├── package.json             # Dependências
└── README.md               # Documentação
```

## 🔧 Como Executar

### Pré-requisitos
- Node.js 12+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repo-url>
cd js-wallet-generator

# Instale dependências
npm install

# Execute o gerador
node src/generateWallet.js
```

### Dependências
```json
{
  "dependencies": {
    "bitcoinjs-lib": "^6.1.0",
    "bip32": "^4.0.0",
    "bip39": "^3.1.0"
  }
}
```

## ⚠️ Segurança e Avisos

### 🔒 Boas Práticas
- **Testnet Only:** Use apenas para testes, nunca mainnet
- **Private Keys:** Nunca compartilhe chaves privadas
- **Mnemonic Security:** Armazene mnemonics com segurança
- **Entropy:** Use fontes seguras de randomness

### 🚨 Avisos Importantes
```javascript
// ⚠️ NUNCA faça isso em produção
console.log('Private Key:', privateKey); // Não logar chaves privadas

// ✅ Melhor prática
const maskedKey = privateKey.slice(0, 4) + '...' + privateKey.slice(-4);
console.log('Private Key:', maskedKey);
```

## 🧪 Verificação com Electrum

### Configuração Testnet
```bash
# Baixar Electrum
wget https://download.electrum.org/4.5.5/Electrum-4.5.5.tar.gz
tar -xvf Electrum-4.5.5.tar.gz

# Executar em modo Testnet
python3 Electrum-4.5.5/run_electrum --testnet

# Importar mnemonic gerado
# File > New/Restore > Standard wallet > I already have a seed
```

## 🚧 Desafios Enfrentados
1. **Criptografia:** Entender curvas elípticas e hash functions
2. **BIP Standards:** Implementar padrões Bitcoin corretamente
3. **Key Derivation:** Compreender caminhos de derivação HD
4. **Network Configuration:** Configurar corretamente testnet vs mainnet
5. **Security:** Implementar práticas seguras de geração
6. **Validation:** Validar endereços e chaves corretamente

## 📚 Recursos Utilizados
- [Bitcoin Developer Guide](https://developer.bitcoin.org/)
- [BIP32 Specification](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)
- [Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook)

## 📈 Próximos Passos
- [ ] Implementar suporte para SegWit (P2WPKH)
- [ ] Adicionar geração de transações
- [ ] Criar interface web para o gerador
- [ ] Implementar backup criptografado
- [ ] Adicionar suporte para múltiplas moedas
- [ ] Criar testes automatizados

## 🔗 Projetos Relacionados
- [Solidity CoinLink Token](../solidity-coinlink-token/) - Smart contracts
- [CryptoTool](../CryptoTool/) - Ferramentas crypto em Go
- [Go PriceGuard API](../go-priceguard-api/) - API para crypto

---

**Desenvolvido por:** Felipe Macedo  
**Contato:** contato.dev.macedo@gmail.com  
**GitHub:** [FelipeMacedo](https://github.com/felipemacedo1)  
**LinkedIn:** [felipemacedo1](https://linkedin.com/in/felipemacedo1)

> 💡 **Reflexão:** Este projeto aprofundou meu entendimento sobre criptografia e blockchain. Trabalhar com padrões Bitcoin e implementar geração segura de carteiras consolidou conhecimentos fundamentais sobre segurança digital.