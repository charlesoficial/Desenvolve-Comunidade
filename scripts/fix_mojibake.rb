#!/usr/bin/env ruby
# encoding: UTF-8
# Conserta arquivos texto onde bytes UTF-8 foram interpretados como
# Windows-1252 (mojibake classico tipo "PublicaÃ§Ã£o" -> "Publicação").
#
# Uso: ruby scripts/fix_mojibake.rb <pasta-ou-arquivo> [...]
#
# Estrategia:
#   1. Le bytes brutos do arquivo.
#   2. Trata como CP1252 e re-decodifica como UTF-8.
#   3. Se o resultado nao tiver mais sequencias mojibake (Ã, Â, â€) e
#      continuar valido em UTF-8, substitui o arquivo.
#   4. Se a conversao nao eliminar mojibake ou produzir invalidos, mantem.

# Forca encoding interno em UTF-8 mesmo quando rodando no Windows com
# console em CP850 (que e o caso do PowerShell ptBR).
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

require "set"

EXTENSIONS = %w[.ts .tsx .js .jsx .rb .css .md .txt .yml .yaml].freeze
SKIP_DIRS  = %w[node_modules dist tmp log .git .playwright-mcp public/uploads vendor coverage].freeze

# Sinais de mojibake comuns. Se ainda aparecerem depois da conversao,
# significa que o ciclo nao foi simples e o arquivo fica como esta.
MOJIBAKE_MARKERS = [
  "\u00C3",         # Ã (raiz da maioria)
  "\u00C2\u0080",   # Â\x80
  "\u00C2\u00A0",   # Â (nbsp)
  "\u00E2\u0080",   # â (zero-width sequences)
  "\u00C3\u0083",   # Ãƒ (mojibake duplo)
].freeze

def list_files(target)
  if File.file?(target)
    return [target] if EXTENSIONS.include?(File.extname(target).downcase)
    return []
  end

  Dir.glob(File.join(target, "**", "*"), File::FNM_DOTMATCH).select do |path|
    next false unless File.file?(path)
    next false unless EXTENSIONS.include?(File.extname(path).downcase)
    rel = path.sub("#{target}/", "")
    SKIP_DIRS.none? { |skip| rel.start_with?("#{skip}/") || rel.include?("/#{skip}/") }
  end
end

def fix(content)
  # Reinterpreta os bytes UTF-8 como Windows-1252 e re-codifica em UTF-8.
  rebuilt = content.dup.force_encoding("UTF-8").encode("Windows-1252", invalid: :replace, undef: :replace, replace: "?").force_encoding("UTF-8")
  rebuilt
rescue Encoding::UndefinedConversionError, Encoding::InvalidByteSequenceError
  nil
end

def has_mojibake?(text)
  MOJIBAKE_MARKERS.any? { |marker| text.include?(marker) }
end

targets = ARGV.empty? ? ["app"] : ARGV
files = targets.flat_map { |t| list_files(t) }.uniq.sort
puts "Scanning #{files.size} files in: #{targets.join(', ')}"

changed = 0
files.each do |path|
  raw = File.binread(path)
  text = raw.dup.force_encoding("UTF-8")
  next unless text.valid_encoding?
  next unless has_mojibake?(text)

  fixed = fix(raw)
  next if fixed.nil?
  next unless fixed.valid_encoding?
  next if has_mojibake?(fixed)

  # Sanity: nao queremos perder caracteres ou criar texto totalmente diferente.
  # Aceitamos so quando o tamanho cai (mojibake usa 2 bytes onde original usa 2),
  # ou se o tamanho varia em ate 30%.
  ratio = fixed.bytesize.to_f / raw.bytesize.to_f
  if ratio < 0.4 || ratio > 1.1
    puts "[skip] #{path} (size ratio #{(ratio * 100).round}%)"
    next
  end

  File.binwrite(path, fixed)
  changed += 1
  puts "[fix]  #{path}"
end

puts "Done. Files changed: #{changed} of #{files.size}"
