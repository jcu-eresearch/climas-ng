<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Transparent gradient</Name>
    <UserStyle>
      <Title>SLD Cook Book: Transparent gradient</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.6</Opacity>
            <ColorMap>
              <ColorMapEntry color="#ffffff" opacity="0" quantity="-1"/>
              <ColorMapEntry color="#ffffff" opacity="1" quantity="0"/>
              <ColorMapEntry color="#9900ff" opacity="1" quantity="1"/>
              </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
