import { ISLAM_WERKE, type IslamWerk } from './schema';

/**
 * Quellenregister des Wissenskurses für `lernapp_quelle` (ADR 0045 Nr. 12, KERN 4.0 §2.4): Werk, Verfasser, Todesjahr nach
 * der Hidschra und OpenITI-Version-URI je Registerschlüssel – wörtlich aus `web/daten/hanafi-quellen/QUELLE.md` (Tabelle
 * „Werke des Quellenregisters“), nie aus dem Gedächtnis (KI-Regel 2). Die Probe `tests/unit/lernapp/wissen-quellen.test.ts`
 * gleicht diese Angaben mit der Tabelle ab. Das Todesjahr steht getrennt (Spalte `todesjahr`), damit die Quellenzeile kurz
 * bleibt (Grenze 1.200 Zeichen je Aussage im Paket). Die Ausgabe (Zitierform) kommt aus den Belegen der Inhaltsdateien.
 * Rein, ohne Datenbank.
 */
export type WissensQuelle = {
  werk: string;
  autor: string;
  todesjahr: number;
  art: (typeof ISLAM_WERKE)[IslamWerk]['art'];
  /** Version-URI ohne Meilenstein; `null`, wenn das Werk in OpenITI fehlt */
  openitiUri: string | null;
};

export const WISSENS_QUELLEN: Record<IslamWerk, WissensQuelle> = {
  quduri: {
    werk: 'Mukhtaṣar al-Qudūrī',
    autor: 'Abū l-Ḥusayn al-Qudūrī',
    todesjahr: 428,
    art: ISLAM_WERKE.quduri.art,
    openitiUri: '0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1',
  },
  nur_al_idah: {
    werk: 'Nūr al-Īḍāḥ',
    autor: 'ash-Shurunbulālī',
    todesjahr: 1069,
    art: ISLAM_WERKE.nur_al_idah.art,
    openitiUri: '1069IbnCammarShurunbulali.NurIdah.JK000284-ara1',
  },
  maraqi_al_falah: {
    werk: 'Marāqī al-Falāḥ',
    autor: 'ash-Shurunbulālī',
    todesjahr: 1069,
    art: ISLAM_WERKE.maraqi_al_falah.art,
    openitiUri: '1069IbnCammarShurunbulali.MaraqiFalahSharhNurIdah.Shamela0000412-ara1',
  },
  hidaya: {
    werk: 'al-Hidāya fī Sharḥ Bidāyat al-Mubtadī',
    autor: 'al-Marghīnānī',
    todesjahr: 593,
    art: ISLAM_WERKE.hidaya.art,
    openitiUri: '0593BurhanDinFarghaniMarghinani.HidayaFiSharhBidaya.JK000242-ara1',
  },
  ikhtiyar: {
    werk: 'al-Ikhtiyār li-Taʿlīl al-Mukhtār',
    autor: 'al-Mawṣilī',
    todesjahr: 683,
    art: ISLAM_WERKE.ikhtiyar.art,
    openitiUri: '0683IbnMahmudMajdDinMawsili.IkhtiyarLiTaclil.Shamela0001066-ara1',
  },
  radd_al_muhtar: {
    werk: 'Radd al-Muḥtār ʿalā d-Durr al-Mukhtār',
    autor: 'Ibn ʿĀbidīn',
    todesjahr: 1252,
    art: ISLAM_WERKE.radd_al_muhtar.art,
    openitiUri: '1252IbnCabidinDimashqi.RaddMukhtar.JK000170-ara1',
  },
  fiqh_akbar: {
    werk: 'al-Fiqh al-Akbar',
    autor: 'Abū Ḥanīfa zugeschrieben',
    todesjahr: 150,
    art: ISLAM_WERKE.fiqh_akbar.art,
    openitiUri: '0150AbuHanifa.FiqhAkbar.JK001085-ara1',
  },
  tahawiyya: {
    werk: 'al-ʿAqīda aṭ-Ṭaḥāwiyya (Matn)',
    autor: 'aṭ-Ṭaḥāwī',
    todesjahr: 321,
    art: ISLAM_WERKE.tahawiyya.art,
    openitiUri: '0321Tahawi.MatnCaqida.JK000126-ara1',
  },
  nasafiyya: {
    werk: 'al-ʿAqāʾid an-Nasafiyya',
    autor: 'Najm ad-Dīn an-Nasafī',
    todesjahr: 537,
    art: ISLAM_WERKE.nasafiyya.art,
    openitiUri: null,
  },
};
