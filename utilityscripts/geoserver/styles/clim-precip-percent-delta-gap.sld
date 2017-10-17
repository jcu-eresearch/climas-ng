<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Precipitation percent change</Name>
    <UserStyle>
      <Title>Precipitation percent change</Title>j
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.7</Opacity>
            <ColorMap>

              <ColorMapEntry color="#dd0011" opacity="1" quantity="-100"/>
              <ColorMapEntry color="#bb5500" opacity="1" quantity="-075"/>
              <ColorMapEntry color="#d89955" opacity="1" quantity="-050" />
              <ColorMapEntry color="#eecc99" opacity="1" quantity="-025" />
              <ColorMapEntry color="#eeffee" opacity="1" quantity="-005" label="liminal" />
              <!-- <ColorMapEntry color="#eeffee" opacity="1" quantity="0" /> -->
              <ColorMapEntry color="#eeffee" opacity="1"  quantity="005" label="liminal" />
              <ColorMapEntry color="#99f6ff" opacity="1"  quantity="025"/>
              <ColorMapEntry color="#2299ee" opacity="1"  quantity="050"/>
              <ColorMapEntry color="#004499" opacity="1"  quantity="075"/>
              <ColorMapEntry color="#000044" opacity="1"  quantity="100"/>
              <ColorMapEntry color="#441177" opacity="1"  quantity="500" label="hidden" />
              <ColorMapEntry color="#9944ff" opacity="1"  quantity="1500" label="hidden" />

            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
