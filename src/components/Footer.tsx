import { useState } from "react";
import { Instagram, Facebook, MessageCircle, Phone, Mail, Clock, MapPin, FileText, Shield, RotateCcw, Truck, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ModalKey = "privacidade" | "termos" | "faq" | "frete" | null;

const Footer = () => {
  const [open, setOpen] = useState<ModalKey>(null);

  return (
    <footer className="bg-[#1c1c1c] text-[#a0a0a0]">
      <div className="px-5 pt-8 pb-6">
        <p className="text-white font-bold text-lg tracking-wide">NEXUS</p>
        <p className="text-[13px] leading-relaxed mt-2 max-w-[300px]">
          Qualidade e estilo para quem vive sobre duas rodas. Sua loja premium de capacetes e acessórios.
        </p>
        <div className="flex items-center gap-5 mt-4">
          <a href="#" aria-label="Instagram"><Instagram size={18} className="text-[#a0a0a0] hover:text-white" /></a>
          <a href="#" aria-label="Facebook"><Facebook size={18} className="text-[#a0a0a0] hover:text-white" /></a>
          <a href="#" aria-label="WhatsApp"><MessageCircle size={18} className="text-[#a0a0a0] hover:text-white" /></a>
        </div>

        <div className="grid grid-cols-2 gap-x-4 mt-8">
          <div>
            <p className="text-white font-semibold text-[13px] mb-3">Contato</p>
            <div className="space-y-2.5">
              <p className="flex items-center gap-2 text-[12px]"><Phone size={13} className="text-[#777] shrink-0" />(89) 98875-8787</p>
              <p className="flex items-center gap-2 text-[12px]"><Mail size={13} className="text-[#777] shrink-0" />contato@nexus.com.br</p>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-[13px] mb-3">Atendimento</p>
            <div className="space-y-2.5">
              <p className="flex items-center gap-2 text-[12px]"><Clock size={13} className="text-[#777] shrink-0" />Seg a Sex: 9h às 18h</p>
              <p className="flex items-center gap-2 text-[12px]"><Clock size={13} className="text-[#777] shrink-0" />Sábado: 9h às 13h</p>
            </div>
            <p className="text-white font-semibold text-[13px] mt-5 mb-2">Pagamento</p>
            <div className="flex items-center gap-3 text-[11px] text-[#999]">
              <span>Pix</span>
              <span>Cartão</span>
              <span>Boleto</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-white font-semibold text-[13px] mb-3">Links Úteis</p>
          <ul className="space-y-2.5 text-[12px]">
            <li className="flex items-center gap-2"><MapPin size={13} className="text-[#777] shrink-0" />Acompanhar Pedido</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen("privacidade")}><Shield size={13} className="text-[#777] shrink-0" />Política de Privacidade</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen("termos")}><FileText size={13} className="text-[#777] shrink-0" />Termos de Uso</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen("frete")}><RotateCcw size={13} className="text-[#777] shrink-0" />Trocas e Devoluções</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen("frete")}><Truck size={13} className="text-[#777] shrink-0" />Frete e Entregas</li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen("faq")}><HelpCircle size={13} className="text-[#777] shrink-0" />Perguntas Frequentes</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#333] px-5 py-4">
        <p className="text-center text-[11px] text-[#666]">© 2026 NEXUS MOTO BRASIL. Todos os direitos reservados.</p>
        <p className="text-center text-[9px] text-[#555] mt-1">Preços, promoções, condições de pagamento e frete exclusivos para o site.</p>
      </div>

      {/* Política de Privacidade */}
      <Dialog open={open === "privacidade"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Política de Privacidade</DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 h-[65vh]">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pr-4">
              <p className="font-semibold text-foreground">1. Informações que coletamos</p>
              <p>Coletamos informações pessoais que você nos fornece diretamente ao realizar uma compra, criar uma conta ou entrar em contato conosco. Isso inclui: nome completo, CPF, endereço de e-mail, número de telefone, endereço de entrega e dados de pagamento.</p>

              <p className="font-semibold text-foreground">2. Como utilizamos suas informações</p>
              <p>Utilizamos seus dados para: processar e entregar seus pedidos; enviar confirmações e atualizações de status; prestar suporte ao cliente; melhorar nossos produtos e serviços; enviar comunicações de marketing (somente com seu consentimento); cumprir obrigações legais e regulatórias.</p>

              <p className="font-semibold text-foreground">3. Compartilhamento de dados</p>
              <p>Seus dados podem ser compartilhados com: transportadoras para entrega dos pedidos; processadores de pagamento para concluir transações; autoridades competentes quando exigido por lei. Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>

              <p className="font-semibold text-foreground">4. Segurança dos dados</p>
              <p>Empregamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Toda comunicação é criptografada via protocolo SSL/TLS.</p>

              <p className="font-semibold text-foreground">5. Cookies</p>
              <p>Utilizamos cookies e tecnologias semelhantes para melhorar a experiência de navegação, analisar o tráfego do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.</p>

              <p className="font-semibold text-foreground">6. Seus direitos</p>
              <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a: acessar seus dados pessoais; corrigir dados incompletos ou desatualizados; solicitar a exclusão de seus dados; revogar o consentimento; solicitar a portabilidade dos dados.</p>

              <p className="font-semibold text-foreground">7. Retenção de dados</p>
              <p>Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Dados de transações são mantidos por no mínimo 5 anos para fins fiscais.</p>

              <p className="font-semibold text-foreground">8. Contato</p>
              <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo e-mail contato@nexus.com.br ou pelo telefone (89) 98875-8787.</p>

              <p className="text-xs text-muted-foreground/60 mt-4">Última atualização: Março de 2026</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Termos de Uso */}
      <Dialog open={open === "termos"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Termos de Uso</DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 h-[65vh]">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pr-4">
              <p className="font-semibold text-foreground">1. Aceitação dos termos</p>
              <p>Ao acessar e utilizar o site da Nexus Moto Brasil, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, por favor, não utilize nosso site.</p>

              <p className="font-semibold text-foreground">2. Uso do site</p>
              <p>Você se compromete a utilizar o site apenas para fins legais e de acordo com estes termos. É proibido: utilizar o site de forma que possa danificá-lo ou prejudicar seu funcionamento; tentar acessar áreas restritas do site sem autorização; utilizar informações do site para fins comerciais sem autorização prévia.</p>

              <p className="font-semibold text-foreground">3. Produtos e preços</p>
              <p>Todos os preços exibidos são em Reais (R$) e incluem impostos aplicáveis. Nos reservamos o direito de alterar preços sem aviso prévio. As imagens dos produtos são meramente ilustrativas e podem apresentar pequenas variações em relação ao produto físico.</p>

              <p className="font-semibold text-foreground">4. Pedidos e pagamento</p>
              <p>A confirmação do pedido está sujeita à aprovação do pagamento e disponibilidade de estoque. Aceitamos pagamento via PIX, cartão de crédito e boleto bancário. O pedido somente será processado após a confirmação do pagamento.</p>

              <p className="font-semibold text-foreground">5. Entrega</p>
              <p>Os prazos de entrega são estimados e contam a partir da confirmação do pagamento. A Nexus Moto Brasil não se responsabiliza por atrasos causados por fatores externos como greves, desastres naturais ou problemas com a transportadora.</p>

              <p className="font-semibold text-foreground">6. Trocas e devoluções</p>
              <p>As trocas e devoluções seguem o Código de Defesa do Consumidor. O prazo para arrependimento é de 7 dias corridos a partir do recebimento do produto. O produto deve ser devolvido em sua embalagem original, sem sinais de uso.</p>

              <p className="font-semibold text-foreground">7. Propriedade intelectual</p>
              <p>Todo o conteúdo do site, incluindo textos, imagens, logotipos e design, é propriedade da Nexus Moto Brasil e está protegido pelas leis de propriedade intelectual. A reprodução sem autorização prévia é proibida.</p>

              <p className="font-semibold text-foreground">8. Limitação de responsabilidade</p>
              <p>A Nexus Moto Brasil não se responsabiliza por danos diretos ou indiretos decorrentes do uso do site, incluindo perda de dados ou interrupção do serviço.</p>

              <p className="font-semibold text-foreground">9. Modificações</p>
              <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após sua publicação no site.</p>

              <p className="text-xs text-muted-foreground/60 mt-4">Última atualização: Março de 2026</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Frete, Entregas, Trocas e Devoluções */}
      <Dialog open={open === "frete"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Frete, Entregas, Trocas e Devoluções</DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 h-[65vh]">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pr-4">
              <p className="font-semibold text-foreground">Frete e prazos de entrega</p>
              <p>Realizamos entregas para todo o Brasil. O prazo de entrega varia de acordo com a região e a modalidade de frete escolhida. Após a postagem, você receberá o código de rastreamento por e-mail.</p>

              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sudeste e Sul:</strong> 3 a 7 dias úteis</li>
                <li><strong>Centro-Oeste e Nordeste:</strong> 5 a 12 dias úteis</li>
                <li><strong>Norte:</strong> 7 a 15 dias úteis</li>
              </ul>

              <p className="font-semibold text-foreground mt-2">Frete grátis</p>
              <p>Oferecemos frete grátis para compras acima de R$ 299,90 para todo o Brasil. Promoções especiais de frete podem ser aplicadas em datas comemorativas.</p>

              <p className="font-semibold text-foreground">Política de trocas</p>
              <p>A primeira troca é por nossa conta! Você tem até 30 dias após o recebimento para solicitar a troca. Para isso, o produto deve estar em sua embalagem original, sem sinais de uso e com todas as etiquetas.</p>

              <p className="font-semibold text-foreground">Como solicitar uma troca</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Entre em contato pelo WhatsApp (89) 98875-8787 ou e-mail contato@nexus.com.br</li>
                <li>Informe o número do pedido e o motivo da troca</li>
                <li>Aguarde as instruções de envio</li>
                <li>Envie o produto conforme orientado</li>
                <li>Após o recebimento e análise, enviaremos o novo produto em até 5 dias úteis</li>
              </ol>

              <p className="font-semibold text-foreground">Devoluções e reembolso</p>
              <p>De acordo com o Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias corridos após o recebimento. O reembolso será realizado na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após o recebimento do produto devolvido.</p>

              <p className="font-semibold text-foreground">Produtos com defeito</p>
              <p>Caso receba um produto com defeito de fabricação, entre em contato imediatamente. A Nexus Moto Brasil se responsabiliza pela coleta e reenvio sem custo adicional. Produtos com defeito estão cobertos pela garantia do fabricante.</p>

              <p className="text-xs text-muted-foreground/60 mt-4">Última atualização: Março de 2026</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Perguntas Frequentes */}
      <Dialog open={open === "faq"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Perguntas Frequentes</DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 h-[65vh]">
            <Accordion type="single" collapsible className="w-full pr-4 [&_button]:text-xs [&_button]:text-left">
              <AccordionItem value="1">
                <AccordionTrigger className="text-sm">Como faço para rastrear meu pedido?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Após a postagem, você receberá um e-mail com o código de rastreamento. Também pode acompanhar pelo nosso WhatsApp informando o número do pedido.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger className="text-sm">Quais formas de pagamento aceitas?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Aceitamos PIX (com aprovação instantânea), cartão de crédito em até 12x e boleto bancário. O pedido é processado após a confirmação do pagamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger className="text-sm">Qual o prazo de entrega?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  O prazo varia por região: Sudeste/Sul (3-7 dias úteis), Centro-Oeste/Nordeste (5-12 dias úteis), Norte (7-15 dias úteis). Os prazos contam a partir da confirmação do pagamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="4">
                <AccordionTrigger className="text-sm">Os produtos possuem garantia?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim! Todos os nossos produtos são originais e possuem garantia de fábrica. O prazo de garantia varia de acordo com o fabricante e está indicado na página de cada produto.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="5">
                <AccordionTrigger className="text-sm">Como escolher o tamanho do capacete?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Meça a circunferência da sua cabeça na altura da testa, acima das orelhas. Consulte a tabela de medidas disponível na página do produto. Em caso de dúvida, entre em contato pelo WhatsApp que ajudamos você a escolher.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="6">
                <AccordionTrigger className="text-sm">Posso trocar meu produto?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim! A primeira troca é por nossa conta. Você tem até 30 dias após o recebimento para solicitar. O produto deve estar na embalagem original e sem sinais de uso.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="7">
                <AccordionTrigger className="text-sm">O frete é grátis?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim, para compras acima de R$ 299,90 o frete é grátis para todo o Brasil. Em datas comemorativas, podemos oferecer frete grátis sem valor mínimo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="8">
                <AccordionTrigger className="text-sm">Como contatar o suporte?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Você pode nos contatar pelo WhatsApp (89) 98875-8787 ou pelo e-mail contato@nexus.com.br. Nosso horário de atendimento é de segunda a sexta das 9h às 18h e aos sábados das 9h às 13h.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="9">
                <AccordionTrigger className="text-sm">Capacetes possuem certificação?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim, todos os capacetes vendidos pela Nexus Moto Brasil possuem certificação do INMETRO, garantindo segurança e qualidade conforme as normas brasileiras.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="10">
                <AccordionTrigger className="text-sm">Emitem nota fiscal?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Sim! Todos os pedidos acompanham nota fiscal eletrônica, enviada automaticamente para o e-mail cadastrado no momento da compra.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
