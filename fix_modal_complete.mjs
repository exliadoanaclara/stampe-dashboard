import fs from 'fs';
const filePath = 'E:\\ruan\\src\\components\\PedidoModal.tsx';
let c = fs.readFileSync(filePath, 'utf8');

// Replace the entire visual.mostrarArtes block (from line 383 to line 640)
const oldBlock = `{visual.mostrarArtes && (
            <div><>
              {/* ARTE PREPARADA NA ETAPA DE ARTES - mostra se houver arte preparada */}
              {selected.arteArteUrls.length > 0 && (
                <section className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                      <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteArteUrls.length} imagem(ns)</span>
                    </div>
                    <div className="flex gap-1">
                      {selected.arteArteUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          download={\`arte-preparada-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.png\`}
                          className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                        >
                          ⬇️ Baixar arte {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-3 md:p-4 bg-zinc-50 rounded-2xl overflow-auto max-h-[520px]">
                    {selected.arteArteUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[16/10] cursor-pointer" onClick={() => setFullscreenUrl(url)}>
                        {renderArtePreview(url, \`Arte preparada \${i + 1}\`)}
                        <a href={url} download={\`arte-preparada-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.\${extensaoDeArte(url) ?? "bin"}\`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                        {canEditArteArte && editMode && (
                          <button
                            onClick={() => {
                              const atualizadas = selected.arteArteUrls.filter((_, idx) => idx !== i)
                              onSubstituirArteArte(atualizadas)
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                            title="Excluir imagem"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEditArteArte && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <input
                        ref={artePrepRef}
                        type="file"
                        accept={ARTE_ACEITOS}
                        multiple
                        className="hidden"
                        onChange={async e => {
                          const files = Array.from(e.target.files ?? [])
                          if (files.length === 0) return
                          const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                          setTempArteUrls(urls)
                        }}
                      />
                      <button
                        onClick={() => artePrepRef.current?.click()}
                        className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                        style={{ background: "#7c3aed" }}
                      >
                        🎨 {selected.arteArteUrls.length > 0 ? "Substituir arte preparada" : "Enviar arte preparada"}
                      </button>
                      {tempArteUrls.length > 0 && (
                        <button
                          onClick={() => {
                            onSubstituirArteArte(tempArteUrls)
                            setTempArteUrls([])
                          }}
                          className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  )}
                </section>
              )}
              {/* ARTE ORIGINAL DO CLIENTE (enviada pelo vendedor na criacao do pedido) */}
              {(selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length > 0 && (
                <section className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                      <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteUrls.length} imagem(ns)</span>
                    </div>
                    <div className="flex gap-1">
                      {selected.arteUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          download={\`arte-original-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.png\`}
                          className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                        >
                          ⬇️ Baixar arte {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-3 md:p-4 bg-zinc-50 rounded-2xl overflow-auto max-h-[420px]">
                    {selected.arteUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[4/3]">
                        {renderArtePreview(url, \`Arte original \${i + 1}\`)}
                        <a href={url} download={\`arte-original-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.\${extensaoDeArte(url) ?? "bin"}\`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                        {canEditArteUrl && editMode && (
                          <button
                            onClick={() => removerArteUrl(i)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                            title="Excluir imagem"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEditArteUrl && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <input
                        ref={arteOrigRef}
                        type="file"
                        accept={ARTE_ACEITOS}
                        multiple
                        className="hidden"
                        onChange={async e => {
                          const files = Array.from(e.target.files ?? [])
                          if (files.length === 0) return
                          const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                          setTempArteUrls(urls)
                        }}
                      />
                      <button
                        onClick={() => arteOrigRef.current?.click()}
                        className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                        style={{ background: cor2 }}
                      >
                        🖼️ {selected.arteUrls.length > 0 ? "Substituir arte original" : "Enviar arte original"}
                      </button>
                      {tempArteUrls.length > 0 && (
                        <button
                          onClick={() => {
                            onSubstituirArte(tempArteUrls)
                            setTempArteUrls([])
                          }}
                          className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  )}
                </section>
              )}
              {/* Estado vazio arte preparada (etapas onde arte preparada é relevante) */}
              {["ARTES", "IMPRESSAO", "PRODUCAO"].includes(selected.etapa) && selected.arteArteUrls.length === 0 && (
                <section className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                  <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                    <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                  </div>
                  <div className="mt-3 text-center py-8">
                    <div className="text-5xl mb-2">🎨</div>
                    <div className="text-sm text-zinc-500 font-medium">Nenhuma arte preparada enviada</div>
                    <div className="text-xs text-zinc-400 mt-1">Envie a arte preparada abaixo</div>
                    {!canEditArteArte && (
                      <div className="text-xs text-zinc-400 mt-1">Aguardando arte preparada da equipe de artes</div>
                    )}
                  </div>
                  {canEditArteArte && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <input
                        ref={artePrepEmptyRef}
                        type="file"
                        accept={ARTE_ACEITOS}
                        multiple
                        className="hidden"
                        onChange={async e => {
                          const files = Array.from(e.target.files ?? [])
                          if (files.length === 0) return
                          const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                          setTempArteArteUrls(urls)
                        }}
                      />
                      <button
                        onClick={() => artePrepEmptyRef.current?.click()}
                        className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                        style={{ background: "#7c3aed" }}
                      >
                        🎨 Enviar arte preparada
                      </button>
                      {tempArteArteUrls.length > 0 && (
                        <button
                          onClick={() => {
                            onSubstituirArteArte(tempArteArteUrls)
                            setTempArteArteUrls([])
                          }}
                          className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  )}
                </section>
              )}
              {/* Estados vazios quando nao ha arte original */}
              {(selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length === 0 && (
                <section className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                  <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                    <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                  </div>
                  <div className="mt-3 text-center py-8">
                    <div className="text-5xl mb-2">🖼️</div>
                    <div className="text-sm text-zinc-500 font-medium">Nenhuma arte original enviada</div>
                    {!canEditArteUrl && (
                      <div className="text-xs text-zinc-400 mt-1">Aguardando arte original do atendimento</div>
                    )}
                  </div>
                  {canEditArteUrl && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <input
                        ref={arteOrigEmptyRef}
                        type="file"
                        accept={ARTE_ACEITOS}
                        multiple
                        className="hidden"
                        onChange={async e => {
                          const files = Array.from(e.target.files ?? [])
                          if (files.length === 0) return
                          const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                          setTempArteUrls(urls)
                        }}
                      />
                      <button
                        onClick={() => arteOrigEmptyRef.current?.click()}
                        className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                        style={{ background: cor2 }}
                      >
                        🖼️ Enviar arte original
                      </button>
                      {tempArteUrls.length > 0 && (
                        <button
                          onClick={() => {
                            onSubstituirArte(tempArteUrls)
                            setTempArteUrls([])
                          }}
                          className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  )}
              </></div>
                  )}
                </section>
              </div>
              )}`;

const newBlock = `{visual.mostrarArtes && (() => {
              const sections = []
              
              // ARTE PREPARADA NA ETAPA DE ARTES
              if (selected.arteArteUrls.length > 0) {
                sections.push(
                  <section key="arte-preparada" className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                      <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                        <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                        <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteArteUrls.length} imagem(ns)</span>
                      </div>
                      <div className="flex gap-1">
                        {selected.arteArteUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            download={\`arte-preparada-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.png\`}
                            className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                          >
                            ⬇️ Baixar arte {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-3 md:p-4 bg-zinc-50 rounded-2xl overflow-auto max-h-[520px]">
                      {selected.arteArteUrls.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[16/10] cursor-pointer" onClick={() => setFullscreenUrl(url)}>
                          {renderArtePreview(url, \`Arte preparada \${i + 1}\`)}
                          <a href={url} download={\`arte-preparada-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.\${extensaoDeArte(url) ?? "bin"}\`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                          {canEditArteArte && editMode && (
                            <button
                              onClick={() => {
                                const atualizadas = selected.arteArteUrls.filter((_, idx) => idx !== i)
                                onSubstituirArteArte(atualizadas)
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                              title="Excluir imagem"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEditArteArte && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={artePrepRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => artePrepRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: "#7c3aed" }}
                        >
                          🎨 {selected.arteArteUrls.length > 0 ? "Substituir arte preparada" : "Enviar arte preparada"}
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArteArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // ARTE ORIGINAL DO CLIENTE
              if ((selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length > 0) {
                sections.push(
                  <section key="arte-original" className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                      <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                        <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                        <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteUrls.length} imagem(ns)</span>
                      </div>
                      <div className="flex gap-1">
                        {selected.arteUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            download={\`arte-original-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.png\`}
                            className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                          >
                            ⬇️ Baixar arte {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-3 md:p-4 bg-zinc-50 rounded-2xl overflow-auto max-h-[420px]">
                      {selected.arteUrls.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[4/3]">
                          {renderArtePreview(url, \`Arte original \${i + 1}\`)}
                          <a href={url} download={\`arte-original-pedido-\${fmtNumero(selected.numero)}-\${i + 1}.\${extensaoDeArte(url) ?? "bin"}\`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                          {canEditArteUrl && editMode && (
                            <button
                              onClick={() => removerArteUrl(i)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                              title="Excluir imagem"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEditArteUrl && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={arteOrigRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => arteOrigRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: cor2 }}
                        >
                          🖼️ {selected.arteUrls.length > 0 ? "Substituir arte original" : "Enviar arte original"}
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // Estado vazio arte preparada
              if (["ARTES", "IMPRESSAO", "PRODUCAO"].includes(selected.etapa) && selected.arteArteUrls.length === 0) {
                sections.push(
                  <section key="arte-preparada-empty" className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                    </div>
                    <div className="mt-3 text-center py-8">
                      <div className="text-5xl mb-2">🎨</div>
                      <div className="text-sm text-zinc-500 font-medium">Nenhuma arte preparada enviada</div>
                      <div className="text-xs text-zinc-400 mt-1">Envie a arte preparada abaixo</div>
                      {!canEditArteArte && (
                        <div className="text-xs text-zinc-400 mt-1">Aguardando arte preparada da equipe de artes</div>
                      )}
                    </div>
                    {canEditArteArte && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={artePrepEmptyRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => artePrepEmptyRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: "#7c3aed" }}
                        >
                          🎨 Enviar arte preparada
                        </button>
                        {tempArteArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArteArte(tempArteArteUrls)
                              setTempArteArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // Estado vazio arte original
              if ((selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length === 0) {
                sections.push(
                  <section key="arte-original-empty" className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                    </div>
                    <div className="mt-3 text-center py-8">
                      <div className="text-5xl mb-2">🖼️</div>
                      <div className="text-sm text-zinc-500 font-medium">Nenhuma arte original enviada</div>
                      {!canEditArteUrl && (
                        <div className="text-xs text-zinc-400 mt-1">Aguardando arte original do atendimento</div>
                      )}
                    </div>
                    {canEditArteUrl && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={arteOrigEmptyRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => arteOrigEmptyRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: cor2 }}
                        >
                          🖼️ Enviar arte original
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              return <div className="space-y-4">{sections}</div>
            })()}`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, c);
  console.log('Successfully replaced visual.mostrarArtes block');
} else {
  console.log('Old block not found - trying alternative...');
  // Try with slight variations
  if (c.includes('visual.mostrarArtes && (')) {
    console.log('Found visual.mostrarArtes pattern');
  }
}