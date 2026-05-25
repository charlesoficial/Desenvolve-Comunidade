# Repara bytes 0x80-0xBF orfaos (sem prefixo 0xC0+ valido) prefixando-os
# com 0xC2 pra restaurar sequencia UTF-8 valida.
param([string[]]$Files)
foreach ($f in $Files) {
  if (-not (Test-Path $f)) { Write-Host "skip $f"; continue }
  $bytes = [System.IO.File]::ReadAllBytes($f)
  $out = New-Object System.Collections.Generic.List[byte] $bytes.Length
  for ($i = 0; $i -lt $bytes.Length; $i++) {
    $b = $bytes[$i]
    if ($b -ge 0x80 -and $b -le 0xBF) {
      $prev = if ($i -eq 0) { 0 } else { $bytes[$i-1] }
      if ($prev -lt 0xC0) {
        $out.Add(0xC2)
        $out.Add($b)
        continue
      }
    }
    $out.Add($b)
  }
  [System.IO.File]::WriteAllBytes($f, $out.ToArray())
  Write-Host "fixed $f ($($bytes.Length) -> $($out.Count) bytes)"
}
